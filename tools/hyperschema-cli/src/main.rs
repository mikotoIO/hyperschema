use clap::Parser;

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// entry file for the schema
    #[arg(short, long)]
    entry: String,
}

fn main() {
    let args = Args::parse();
}
