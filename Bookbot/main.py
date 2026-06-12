import sys
from stats import get_word_numbers
from stats import get_letter_count
from stats import sort_on
from stats import create_dict_list


def get_book_text(filepath):
    with open(filepath) as content:
        return content.read()

def get_word_numbers(book):
    count = 0
    words = book.split()

    for word in words:
        count += 1
    
    print(f"Found {count} total words")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 main.py <path_to_book>")
        sys.exit(1)
    else:        
        book = get_book_text(sys.argv[1])
        word_count = get_word_numbers(book)
        letter_count = get_letter_count(book)
        sorted_dict_list = create_dict_list(letter_count)
        print(word_count)
        print(letter_count)
        for item in sorted_dict_list:
            if item["char"].isalpha():
                print(f"{item["char"]}: {item["num"]}")

    print(len(sys.argv))

main()

