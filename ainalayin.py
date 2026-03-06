import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


START_DELAY = 2.0
DEFAULT_CHAR_DELAY = 0.13
LINE_DELAY = 0.55

SCRIPT = [
    [("Жарқын құшақ", 0.3), (" жайған айым", None)],
    [("Ниетіңе", 0.6), (" сай болайын", None)],
    [("Мені сүйген", 0.4), (" жүрегіңнің", None)],
    [("Лүпілінен", 0.4), (" айналайын", 0.5)],
    [("Өзің едің", 0.3), (" тірегім де,", None)],
    [("Жыр боп тұңтың жүрегімде", 0.3)],
    [("Мені сендей", 0.4), (" түсінетін", None)],
    [("Кім бар екен", 0.4), (" бұл өмірде", None)],
]


def safe_write(text: str) -> None:
    try:
        sys.stdout.write(text)
        sys.stdout.flush()
    except OSError:
        pass


def type_text(text: str, delay: float = DEFAULT_CHAR_DELAY) -> None:
    for char in text:
        safe_write(char)
        time.sleep(delay)


def print_line(parts: list[tuple[str, float | None]]) -> None:
    safe_write("$ ")

    for text, pause_after in parts:
        type_text(text)
        if pause_after:
            time.sleep(pause_after)

    safe_write("\n")


def main() -> None:
    time.sleep(START_DELAY)
    for parts in SCRIPT:
        print_line(parts)
        time.sleep(LINE_DELAY)


if __name__ == "__main__":
    main()
