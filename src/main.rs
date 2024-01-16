//==================================<===|===>=================================//
#![allow(unused_parens)]
mod sprite;
mod utility;
mod state;
mod graphical;
mod events;
mod messages;

use ggez::{Context, ContextBuilder, GameResult, conf};
use ggez::event::{self, EventHandler, KeyCode, KeyMods};
use ggez::graphics;
use std::io::Write;

use crate::utility::*;
use crate::graphical::*;
use crate::state::*;
use crate::messages::*;

//=================================== Main ===================================//
fn main() {
    // open a window
    let my_window_settings = conf::WindowSetup {
	title: "KeyWords".to_owned(),
	samples: conf::NumSamples::One,
	vsync: true,
	icon: "".to_owned(),
	srgb: true,
    };
    let mut my_window_mode = conf::WindowMode::default();
    my_window_mode.resizable  = true;
    my_window_mode.min_width  = 400.0;
    my_window_mode.min_height = 300.0;
    my_window_mode.width      = SCREEN_WIDTH;
    my_window_mode.height     = SCREEN_HEIGHT;
    //my_window_mode.fullscreen_type = conf::FullscreenType::True;

    // Make a Context and an EventLoop.
    let (mut ctx, event_loop) =
       ContextBuilder::new("KeyWords", "weston")
	.window_setup(my_window_settings)
	.window_mode(my_window_mode)
        .build()
        .unwrap();

    graphics::set_default_filter(&mut ctx, graphics::FilterMode::Nearest);
    
    // Create an instance of your event handler.
    // Usually, you should provide it with the Context object
    // so it can load resources like images during setup.
    let my_runner = match MyRunner::new(&mut ctx) {
        Ok(r) => r,
        Err(e) => panic!("failed to create MyRunner: {}", e)
    };

    // Run!
    event::run(ctx, event_loop, my_runner);
}


//================================= MyRunner ================================//
struct MyRunner {
    graphical: Graphical,
    state_manager: StateManager,
    message_manager: MessageManager,
    keyboard_input: String,
}

impl MyRunner {
    fn new(ctx: &mut Context) -> Result<Self> {
        let runner = MyRunner {
	    graphical: Graphical::new(ctx),
            state_manager: StateManager::new(),
            message_manager: MessageManager::new(),
            keyboard_input: String::new(),
        };
        
        Ok(runner)
    }

}

impl EventHandler<ggez::GameError> for MyRunner {
    fn update(&mut self, ctx: &mut Context) -> GameResult<()> {
        self.state_manager.tick(ctx);
        let messages = self.message_manager.get_input_messages();
        for m in messages {
            self.state_manager.handle_input(m, ctx);
        }
        //
        if self.message_manager.needs_state() {
            self.message_manager.send_state(&self.state_manager);
        }
        if self.state_manager.state_update {
            self.message_manager.send_state_to_all(&self.state_manager);
            self.state_manager.state_update = false;
        }
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        self.graphical.draw(ctx, &self.state_manager)?;
        graphics::present(ctx)
    }

    fn key_down_event(&mut self, _ctx: &mut Context, key: KeyCode, _mods: KeyMods, _:bool) {
        match key  {
            KeyCode::Return => {
                println!("");
                self.message_manager.handle_keyboard_input(std::mem::take(&mut self.keyboard_input));
            }
            _ => ()
        }
    }

    fn text_input_event(&mut self, _ctx: &mut Context, character: char) {
        match character {
            '\n' | '\r' | '\u{0008}' | '\u{001B}' => (),
            c => {
                print!("{}", c);
                std::io::stdout().flush().unwrap(); // TODO
                self.keyboard_input.push(c);
            },
        }
    }

}
//==================================<===|===>=================================//
