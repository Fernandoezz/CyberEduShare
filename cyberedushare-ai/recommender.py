from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId
import os
import numpy as np

def get_db():
    client = MongoClient(os.getenv('MONGO_URI'))
    return client['test']  # change 'test' to your actual DB name if different

def get_recommendations(
    enrolled_courses: list,
    bookmarked_ids: list,
    viewed_subjects: list,
    limit: int = 6,
) -> list:
    db = get_db()

    # ── Fetch all active resources from MongoDB
    resources = list(db['contents'].find(
        {'isVerified': True},
        {
            '_id': 1, 'title': 1, 'description': 1,
            'subject': 1, 'difficulty': 1, 'tags': 1,
            'type': 1, 'uploaderName': 1, 'fileUrl': 1,
            'averageRating': 1,
        }
    ))

    if not resources:
        return []

    # ── Exclude already bookmarked
    bookmarked_set = set(bookmarked_ids)
    resources = [
        r for r in resources
        if str(r['_id']) not in bookmarked_set
    ]

    if not resources:
        return []

    # ── Build text corpus for each resource
    # Combine title + description + subject + tags into one string
    def build_resource_text(r):
        parts = [
            r.get('title', ''),
            r.get('description', ''),
            r.get('subject', ''),
            ' '.join(r.get('tags', [])),
        ]
        return ' '.join(parts).lower()

    # ── Build query from student context
    # Combine enrolled courses + viewed subjects into a query string
    all_interests = enrolled_courses + viewed_subjects
    query_text = ' '.join(all_interests).lower()

    # Add course-specific cybersecurity keywords
    keyword_map = {
        'cs101': 'programming fundamentals algorithms data structures',
        'cs102': 'object oriented programming java python classes',
        'cs201': 'data structures trees graphs sorting searching',
        'cs205': 'cybersecurity web security sql injection xss penetration',
        'networks': 'networking tcp ip protocols routing switching nmap',
        'cryptography': 'encryption decryption rsa aes cipher keys hashing',
        'os': 'operating systems linux kernel processes memory',
    }

    for course in enrolled_courses:
        key = course.lower().replace(' ', '')
        if key in keyword_map:
            query_text += ' ' + keyword_map[key]

    # ── TF-IDF vectorization
    corpus = [build_resource_text(r) for r in resources]
    corpus.append(query_text)  # query is the last item

    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except Exception as e:
        print(f'TF-IDF error: {e}')
        return _fallback_recommendations(resources, enrolled_courses, limit)

    # ── Compute similarity between query and each resource
    query_vector   = tfidf_matrix[-1]       # last item is query
    resource_matrix = tfidf_matrix[:-1]     # all others are resources

    similarities = cosine_similarity(query_vector, resource_matrix).flatten()

    # ── Score = TF-IDF similarity + subject match boost + rating boost
    scores = []
    for i, resource in enumerate(resources):
        score = float(similarities[i])

        # Boost if subject directly matches enrolled course
        resource_subject = resource.get('subject', '').upper()
        for course in enrolled_courses:
            if course.upper() in resource_subject or resource_subject in course.upper():
                score += 0.3
                break

        # Boost by average rating (0-5 scaled to 0-0.1)
        avg_rating = resource.get('averageRating', 0) or 0
        score += avg_rating * 0.02

        scores.append((i, score))

    # ── Sort by score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    top_indices = [idx for idx, _ in scores[:limit]]

    # ── Format results
    results = []
    for idx in top_indices:
        r = resources[idx]
        results.append({
            'id':           str(r['_id']),
            'title':        r.get('title', ''),
            'description':  r.get('description', ''),
            'subject':      r.get('subject', ''),
            'difficulty':   r.get('difficulty', 'Medium'),
            'type':         r.get('type', ''),
            'uploaderName': r.get('uploaderName', ''),
            'fileUrl':      r.get('fileUrl', ''),
            'averageRating': r.get('averageRating', 0) or 0,
            'score':        round(scores[top_indices.index(idx)][1], 3),
        })

    return results


def _fallback_recommendations(resources, enrolled_courses, limit):
    """Fallback: return resources that match enrolled course subjects"""
    matched = []
    unmatched = []

    for r in resources:
        subject = r.get('subject', '').upper()
        match = any(
            c.upper() in subject or subject in c.upper()
            for c in enrolled_courses
        )
        if match:
            matched.append(r)
        else:
            unmatched.append(r)

    combined = (matched + unmatched)[:limit]

    return [{
        'id':           str(r['_id']),
        'title':        r.get('title', ''),
        'description':  r.get('description', ''),
        'subject':      r.get('subject', ''),
        'difficulty':   r.get('difficulty', 'Medium'),
        'type':         r.get('type', ''),
        'uploaderName': r.get('uploaderName', ''),
        'fileUrl':      r.get('fileUrl', ''),
        'averageRating': r.get('averageRating', 0) or 0,
        'score':        0.0,
    } for r in combined]