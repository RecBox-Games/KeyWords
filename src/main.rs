#![allow(unused_parens)]
mod sprite;
mod utility;
mod state;
mod graphical;

use ggez::{Context, ContextBuilder, GameResult, conf};
use ggez::event::{self, EventHandler};
use ggez::graphics;
//use ggez::graphics::{Color, Rect};

/*use targetlib::{CPSpec, Button, Panel, ControlDatum};
use controlpads::*;

use std::collections::HashMap;
use std::fs;
use rand::{seq::IteratorRandom, thread_rng};

mod json_client;
use crate::json_client::*;
 */

use crate::utility::*;
use crate::graphical::*;
use crate::state::*;

const START_WIDTH:  f32 = 1920.0;
const START_HEIGHT: f32 = 1080.0;

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
    my_window_mode.width      = START_WIDTH;
    my_window_mode.height     = START_HEIGHT;
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


struct MyRunner {
    graphical: Graphical,
    game_state: GameState,
}

impl MyRunner {
    
    fn new(ctx: &mut Context) -> Result<Self> {
        let runner = MyRunner {
	    graphical: Graphical::new(ctx),
            game_state: GameState::new(),
        };
        
        Ok(runner)
    }

}

impl EventHandler<ggez::GameError> for MyRunner {

    fn update(&mut self, _ctx: &mut Context) -> GameResult<()> {
        self.game_state.tick();
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult<()> {
        self.graphical.draw(ctx, &self.game_state)?;
        graphics::present(ctx)
    }

}
