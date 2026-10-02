#include <arpa/inet.h>
#include <asm-generic/errno-base.h>
#include <asm-generic/errno.h>
#include <errno.h>
#include <linux/if_ether.h>
#include <net/ethernet.h>
#include <net/if.h>
#include <netinet/if_ether.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <netpacket/packet.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/types.h>

typedef struct __attribute__((packed)) {
    uint16_t htype;
    uint16_t ptype;
    uint8_t hlen;
    uint8_t plen;
    uint16_t oper;
    uint8_t sha[6];
    uint8_t spa[4];
    uint8_t tha[6];
    uint8_t tpa[4];

} arp_packet;

typedef struct __attribute__((packed)) {
    uint8_t dstmac[6];
    uint8_t smac[6];
    uint16_t ether_type;
} e_header;

typedef struct __attribute__((packed)) {
    e_header eth;
    arp_packet arp;
} arp_frame;

arp_packet create_packet(uint8_t last_digit) {
    arp_packet packet = {
        .htype = htons(1),
        .ptype = htons(0x0800),
        .hlen = 6,
        .plen = 4,
        .oper = htons(1),
        .sha = {0x00, 0xF4, 0x8D, 0xC1, 0x3F, 0xA5}, // my mac here
        .spa = {192, 168, 0, 221},
        .tha = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
        .tpa = {192, 168, 0, last_digit},
    };
    return packet;
}

int main() {
    e_header eth_header = {
        .dstmac = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF},
        .smac = {0x00, 0xF4, 0x8D, 0xC1, 0x3F, 0xA5},
        .ether_type = htons(0x0806),
    };

    arp_frame frame[255];

    int sock = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ARP));

    struct sockaddr_ll addr = {0};

    struct ifreq ifr;
    memset(&ifr, 0, sizeof(ifr));
    strncpy(ifr.ifr_name, "wlp3s0", IFNAMSIZ - 1);

    if (ioctl(sock, SIOCGIFINDEX, &ifr) == -1) {
        perror("ioctl");
        return 1;
    }

    addr.sll_family = AF_PACKET;
    addr.sll_protocol = htons(ETH_P_ARP);
    addr.sll_ifindex = ifr.ifr_ifindex;
    addr.sll_halen = 6;
    memcpy(addr.sll_addr, eth_header.dstmac, 6);

    for (int i = 1; i < 254; i++) {
        frame[i].eth = eth_header;
        frame[i].arp = create_packet(i);

        sendto(sock, &frame[i], sizeof(frame[i]), 0, (struct sockaddr *)&addr,
               sizeof(addr));
    }

    struct timeval tv;
    tv.tv_sec = 3;
    tv.tv_usec = 500000;

    if (setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv)) < 0) {
        perror("setsockopt(S0_rcvtimeo");
    }

    uint8_t recv_buf[1500];
    struct sockaddr_ll recv_addr;
    socklen_t addr_len = sizeof(recv_addr);

    while (1) {

        int len = recvfrom(sock, recv_buf, sizeof(recv_buf), 0,
                           (struct sockaddr *)&recv_addr, &addr_len);

        if (len < 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                break;
            }
        }

        if (len < sizeof(e_header) + sizeof(arp_packet)) {
            continue;
        }

        arp_packet *recv_arp = (arp_packet *)(recv_buf + sizeof(e_header));

        if (recv_arp->oper != htons(2)) {
            continue;
        }
        // Print IP and MAC
        printf("%d.%d.%d.%d -> %02x:%02x:%02x:%02x:%02x:%02x\n",
               recv_arp->spa[0], recv_arp->spa[1], recv_arp->spa[2],
               recv_arp->spa[3], recv_arp->sha[0], recv_arp->sha[1],
               recv_arp->sha[2], recv_arp->sha[3], recv_arp->sha[4],
               recv_arp->sha[5]);
    }
    return 0;
}
