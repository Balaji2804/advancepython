import spacy

# Load the SpaCy model
nlp = spacy.load('en_core_web_sm')

# Process text
doc = nlp("SpaCy is an NLP library for Python.")

# Tokenization
tokens = [token.text for token in doc]
print(f'Tokens: {tokens}')

# Lemmatization
lemmas = [token.lemma_ for token in doc]
print(f'Lemmas: {lemmas}')

# POS Tagging
pos_tags = [(token.text, token.pos_) for token in doc]
print(f'POS Tags: {pos_tags}')

# Load the SpaCy model
nlp = spacy.load('en_core_web_sm')

# Process text
doc = nlp("SpaCy is an NLP library for Python.")

# Tokenization
tokens = [token.text for token in doc]
print(f'Tokens: {tokens}')

# Lemmatization
lemmas = [token.lemma_ for token in doc]
print(f'Lemmas: {lemmas}')

# POS Tagging
pos_tags = [(token.text, token.pos_) for token in doc]
print(f'POS Tags: {pos_tags}')
