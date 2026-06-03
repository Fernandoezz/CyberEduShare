from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from recommender import get_recommendations
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI service running', 'port': 5001})

@app.route('/recommendations', methods=['POST'])
def recommendations():
    try:
        body = request.get_json()

        enrolled_courses  = body.get('enrolledCourses', [])
        bookmarked_ids    = body.get('bookmarkedIds', [])
        viewed_subjects   = body.get('viewedSubjects', [])
        limit             = body.get('limit', 6)

        if not enrolled_courses:
            return jsonify({'recommendations': [], 'message': 'No enrolled courses provided'})

        results = get_recommendations(
            enrolled_courses=enrolled_courses,
            bookmarked_ids=bookmarked_ids,
            viewed_subjects=viewed_subjects,
            limit=limit,
        )

        return jsonify({'recommendations': results})

    except Exception as e:
        print(f'Recommendations error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f'🤖 AI Recommendation service running on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)