#include <furi.h>
#include <gui/gui.h>
#include <infrared_transmit.h>
#include <input/input.h>

typedef enum {
    ScreenMenu,
    ScreenBruteforcing,
    ScreenDone,
} AppScreen;

typedef struct {
    FuriMutex *mutex;
    AppScreen screen;
    uint16_t current; // index we're on
    uint16_t total;   // total combinations
    uint8_t current_addr;
} AppState;

static void draw_callback(Canvas *canvas, void *ctx) {
    AppState *state = ctx;
    furi_mutex_acquire(state->mutex, FuriWaitForever);

    canvas_clear(canvas);
    canvas_set_font(canvas, FontPrimary);

    if (state->screen == ScreenMenu) {
        canvas_draw_str(canvas, 10, 10, "MIMI BRVT3R");
        canvas_set_font(canvas, FontSecondary);
        canvas_draw_str(canvas, 10, 25, "OK: start  Back: exit");
    } else if (state->screen == ScreenBruteforcing) {
        canvas_draw_str(canvas, 10, 10, "Bruteforcing...");
        canvas_set_font(canvas, FontSecondary);

        char buf[32];
        snprintf(buf, sizeof(buf), "%u / %u", state->current, state->total);
        canvas_draw_str(canvas, 10, 24, buf);

        snprintf(buf, sizeof(buf), "Addr: 0x%02X", state->current_addr);
        canvas_draw_str(canvas, 10, 36, buf);

        // progress bar
        uint8_t bar_w = 118;
        uint8_t filled = (uint8_t)((state->current * bar_w) /
                                   (state->total ? state->total : 1));
        canvas_draw_frame(canvas, 5, 45, bar_w + 2, 10);
        canvas_draw_box(canvas, 6, 46, filled, 8);

        canvas_draw_str(canvas, 10, 63, "Back: stop");
    } else if (state->screen == ScreenDone) {
        canvas_draw_str(canvas, 10, 10, "Done!");
        canvas_set_font(canvas, FontSecondary);
        canvas_draw_str(canvas, 10, 25, "OK: menu  Back: exit");
    }

    furi_mutex_release(state->mutex);
}

static void input_callback(InputEvent *input_event, void *ctx) {
    FuriMessageQueue *queue = ctx;
    furi_message_queue_put(queue, input_event, FuriWaitForever);
}

static void send_nec_code(uint8_t address, uint8_t command) {
    InfraredMessage message = {
        .protocol = InfraredProtocolNEC,
        .address = address,
        .command = command,
        .repeat = false,
    };
    infrared_send(&message, 1);
}

int32_t ir_brute_app(void *p) {
    UNUSED(p);
    FuriMessageQueue *input_queue =
        furi_message_queue_alloc(8, sizeof(InputEvent));

    AppState state = {
        .mutex = furi_mutex_alloc(FuriMutexTypeNormal),
        .screen = ScreenMenu,
        .current = 0,
        .total = 256,
        .current_addr = 0,
    };

    ViewPort *view_port = view_port_alloc();
    view_port_draw_callback_set(view_port, draw_callback, &state);
    view_port_input_callback_set(view_port, input_callback, input_queue);
    Gui *gui = furi_record_open(RECORD_GUI);
    gui_add_view_port(gui, view_port, GuiLayerFullscreen);

    InputEvent event;
    bool running = true;
    while (running) {
        if (furi_message_queue_get(input_queue, &event, FuriWaitForever) ==
            FuriStatusOk) {
            if (event.type == InputTypePress) {
                if (event.key == InputKeyBack) {
                    if (state.screen == ScreenBruteforcing) {
                        // stop mid-run, back to menu
                        furi_mutex_acquire(state.mutex, FuriWaitForever);
                        state.screen = ScreenMenu;
                        furi_mutex_release(state.mutex);
                    } else {
                        running = false;
                    }
                } else if (event.key == InputKeyOk) {
                    if (state.screen == ScreenMenu ||
                        state.screen == ScreenDone) {
                        furi_mutex_acquire(state.mutex, FuriWaitForever);
                        state.screen = ScreenBruteforcing;
                        state.current = 0;
                        furi_mutex_release(state.mutex);

                        for (uint16_t addr = 0; addr < state.total; addr++) {
                            // check for stop request (non-blocking)
                            InputEvent check;
                            if (furi_message_queue_get(input_queue, &check,
                                                       0) == FuriStatusOk) {
                                if (check.type == InputTypePress &&
                                    check.key == InputKeyBack) {
                                    furi_mutex_acquire(state.mutex,
                                                       FuriWaitForever);
                                    state.screen = ScreenMenu;
                                    furi_mutex_release(state.mutex);
                                    break;
                                }
                            }

                            send_nec_code((uint8_t)addr, 0x00);

                            furi_mutex_acquire(state.mutex, FuriWaitForever);
                            state.current = addr + 1;
                            state.current_addr = (uint8_t)addr;
                            furi_mutex_release(state.mutex);

                            view_port_update(
                                view_port); // triggers redraw on gui thread
                            furi_delay_ms(100);
                        }

                        furi_mutex_acquire(state.mutex, FuriWaitForever);
                        if (state.screen == ScreenBruteforcing)
                            state.screen = ScreenDone;
                        furi_mutex_release(state.mutex);
                    }
                }
            }
        }
        view_port_update(view_port);
    }

    view_port_enabled_set(view_port, false);
    gui_remove_view_port(gui, view_port);
    furi_record_close(RECORD_GUI);
    view_port_free(view_port);
    furi_message_queue_free(input_queue);
    furi_mutex_free(state.mutex);
    return 0;
}
