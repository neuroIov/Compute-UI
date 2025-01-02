from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    # Simulate model prediction
    data = request.get_json()
    # Just return a random prediction for testing
    return jsonify({
        'prediction': float(np.random.random()),
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
