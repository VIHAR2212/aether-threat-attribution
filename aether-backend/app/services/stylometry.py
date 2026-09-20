"""Stylometry analysis service for Project AETHER.

Compares suspect text samples using character and word n-gram vectorization,
cosine similarity, and forensic stylistic features (lexical richness, sentence
length distribution, and punctuation frequency).
"""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any, Dict, List, Tuple


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def tokenize_words(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric words."""
    return re.findall(r"\b\w+\b", text.lower())


def tokenize_sentences(text: str) -> List[str]:
    """Split text into sentences based on standard punctuation."""
    sentences = re.split(r"[.!?]+(?:\s+|$)", text.strip())
    return [s.strip() for s in sentences if s.strip()]


def extract_char_ngrams(text: str, n: int = 3) -> Counter[str]:
    """Extract character n-grams from normalized text."""
    normalized = _clean_text(text.lower())
    if len(normalized) < n:
        return Counter([normalized]) if normalized else Counter()
    return Counter(normalized[i : i + n] for i in range(len(normalized) - n + 1))


def extract_word_ngrams(tokens: List[str], n: int = 2) -> Counter[str]:
    """Extract word n-grams from tokenized words."""
    if len(tokens) < n:
        return Counter([" ".join(tokens)]) if tokens else Counter()
    return Counter(" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1))


def cosine_similarity(counter_a: Counter[str], counter_b: Counter[str]) -> float:
    """Compute exact cosine similarity between two frequency Counters."""
    if not counter_a or not counter_b:
        return 0.0

    intersection = set(counter_a.keys()) & set(counter_b.keys())
    dot_product = sum(counter_a[k] * counter_b[k] for k in intersection)

    norm_a = math.sqrt(sum(v * v for v in counter_a.values()))
    norm_b = math.sqrt(sum(v * v for v in counter_b.values()))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return round(float(dot_product / (norm_a * norm_b)), 4)


def compute_lexical_metrics(text: str) -> Dict[str, Any]:
    """Extract forensic stylometric markers from a single text."""
    words = tokenize_words(text)
    sentences = tokenize_sentences(text)

    total_words = len(words)
    total_unique = len(set(words))
    ttr = round(total_unique / total_words, 4) if total_words > 0 else 0.0

    avg_sentence_len = round(total_words / len(sentences), 2) if sentences else 0.0

    # Punctuation counts
    punct_patterns = {
        "semicolons": r";",
        "colons": r":",
        "hyphens": r"-",
        "commas": r",",
        "exclamations": r"!",
        "questions": r"\?",
        "ellipses": r"\.{3}|…",
    }
    punct_counts = {
        name: len(re.findall(pattern, text))
        for name, pattern in punct_patterns.items()
    }

    # Casing characteristics
    letters = [c for c in text if c.isalpha()]
    total_letters = len(letters)
    uppercase_ratio = (
        round(sum(1 for c in letters if c.isupper()) / total_letters, 4)
        if total_letters > 0
        else 0.0
    )

    return {
        "word_count": total_words,
        "unique_words": total_unique,
        "type_token_ratio": ttr,
        "sentence_count": len(sentences),
        "avg_sentence_length": avg_sentence_len,
        "punctuation_counts": punct_counts,
        "uppercase_ratio": uppercase_ratio,
    }


def analyze_stylometry(text_a: str, text_b: str) -> Dict[str, Any]:
    """Perform comparative forensic stylometry between two texts."""
    words_a = tokenize_words(text_a)
    words_b = tokenize_words(text_b)

    # 1. Character 3-gram similarity (captures sub-word morphology and spelling quirks)
    char_3grams_a = extract_char_ngrams(text_a, n=3)
    char_3grams_b = extract_char_ngrams(text_b, n=3)
    char_3gram_sim = cosine_similarity(char_3grams_a, char_3grams_b)

    # 2. Word unigram similarity (vocabulary overlap)
    word_uni_a = Counter(words_a)
    word_uni_b = Counter(words_b)
    word_unigram_sim = cosine_similarity(word_uni_a, word_uni_b)

    # 3. Word bigram similarity (phrasal habits)
    word_bi_a = extract_word_ngrams(words_a, n=2)
    word_bi_b = extract_word_ngrams(words_b, n=2)
    word_bigram_sim = cosine_similarity(word_bi_a, word_bi_b)

    # Weighted composite stylometry score:
    # Char 3-grams are robust for short darknet forum snippets (0.50)
    # Word unigrams measure shared technical lexicon (0.30)
    # Word bigrams measure syntax/phrasing habits (0.20)
    composite_score = round(
        (0.50 * char_3gram_sim) + (0.30 * word_unigram_sim) + (0.20 * word_bigram_sim),
        4,
    )

    metrics_a = compute_lexical_metrics(text_a)
    metrics_b = compute_lexical_metrics(text_b)

    # Shared vocabulary
    shared_vocab = sorted(list(set(words_a) & set(words_b)))

    return {
        "similarity_score": composite_score,
        "breakdown": {
            "char_3gram_cosine": char_3gram_sim,
            "word_unigram_cosine": word_unigram_sim,
            "word_bigram_cosine": word_bigram_sim,
        },
        "shared_tokens_count": len(shared_vocab),
        "shared_tokens_sample": shared_vocab[:15],
        "sample_a_metrics": metrics_a,
        "sample_b_metrics": metrics_b,
    }
