def get_word_numbers(book):
    count = 0
    words = book.split()

    for word in words:
        count += 1

def get_letter_count(book):
    count = {}

    for character in book:
        character = character.lower()
        
        if character in count:
            count[character] += 1
        else:
            count[character] = 1

    return count

def sort_on(x):
    return x["num"]

def create_dict_list(dictionary):
    dict_list = []

    for key in dictionary:
        dict_in_list = {"char": key, "num": dictionary[key]}
        dict_list.append(dict_in_list)

    dict_list.sort(reverse=True, key=sort_on)
    return dict_list



    