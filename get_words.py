#!/bin/python3
import nltk
from nltk.corpus import wordnet as wn
from nltk.corpus import words

# Download necessary NLTK data
#nltk.download('wordnet')
#nltk.download('words')

def get_words_with_multiple_noun_defs():
    words_with_multiple_noun_defs = {}

    # Iterate through all synsets in WordNet
    for synset in wn.all_synsets():
        # Check if the synset is of noun type
        if synset.pos() == 'n':
            # Get the lemma names (words) for the synset
            for lemma in synset.lemmas():
                word = lemma.name().replace('_', ' ')
                if word in words_with_multiple_noun_defs:
                    words_with_multiple_noun_defs[word].add(synset)
                else:
                    words_with_multiple_noun_defs[word] = {synset}

        if synset.pos() == 'n':
            # Get the lemma names (words) for the synset
            for lemma in synset.lemmas():
                word = lemma.name().replace('_', ' ')
                if word in words_with_multiple_noun_defs:
                    words_with_multiple_noun_defs[word].add(synset)
                else:
                    words_with_multiple_noun_defs[word] = {synset}
                    
    # Filter words with more than one unique noun definition
    return {word: defs for word, defs in words_with_multiple_noun_defs.items() if len(defs) > 1}


def main():
    with open("common10000.txt") as f:
        top_words = f.read().split('\n')
    with open("creiky.txt") as f:
        creiky_words = f.read().split('\n')
    multi_words = get_words_with_multiple_noun_defs()

    with open("resources/words/culled_words.txt") as f:
        culled_words = [w.lower() for w in f.read().split('\n')]

    with open("a.txt") as f:
        a_words = f.read().split('\n')
        
    
    for word in top_words:
        if word in multi_words and word in creiky_words and not word in culled_words and not word in a_words:
            print(word)

if __name__ == "__main__":
    main()
