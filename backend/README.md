# StarCoder2 Code Generation Backend

This backend provides both API-based and local model-based code generation using the StarCoder2 model.

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. For local model usage, install Python dependencies:
```bash
pip install git+https://github.com/huggingface/transformers.git
pip install torch accelerate bitsandbytes
```

3. Create a `.env` file with your Hugging Face token:
```
HF_TOKEN=your_huggingface_token_here
```

## Usage

### Start the server
```bash
npm start
```

The server will run on port 3000 by default.

### API Endpoints

#### Generate code using Hugging Face API
```
POST /starcoder2
```
Body:
```json
{
  "prompt": "def fibonacci(n):"
}
```

#### Generate code using local model
```
POST /local-generate
```
Body:
```json
{
  "prompt": "def fibonacci(n):"
}
```

#### Check model availability
```
GET /check-models
```

#### Check server status
```
GET /api-status
```

#### Get setup instructions
```
GET /setup-instructions
```

## Hardware Requirements for Local Model

- CPU: Will work but very slow
- GPU: NVIDIA GPU with at least 16GB VRAM recommended
- RAM: At least 16GB system RAM

## Model Information

StarCoder2 is a 15B parameter model trained on code from 600+ programming languages. 
It can generate code snippets based on prompts.

For more information, see [StarCoder2 on Hugging Face](https://huggingface.co/bigcode/starcoder2-15b).
