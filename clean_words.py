def clean_dictionary(input_file, output_file):
    with open(input_file, 'r') as f:
        words = f.readlines()

    cleaned_words = [word.strip() for word in words if len(word.strip()) > 2]

    with open(output_file, 'w') as f:
        for word in cleaned_words:
            f.write(f"{word}\n")

input_file = 'words.txt'
output_file = 'dictionary.txt'
clean_dictionary(input_file, output_file)