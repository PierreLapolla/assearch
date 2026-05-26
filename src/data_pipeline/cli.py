from argparse import ArgumentParser

from data_pipeline.pipeline import run_pipeline


def parse_args() -> str:
    parser = ArgumentParser()
    parser.add_argument(
        "step",
        choices=("download", "index", "all"),
        nargs="?",
        default="all",
    )
    return parser.parse_args().step


def main() -> None:
    run_pipeline(parse_args())


if __name__ == "__main__":
    main()
