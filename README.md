# Image Compressor

A robust Node.js application for efficient image compression and format conversion, powered by the Tinify API. Designed with a dual-mode architecture to support both automated local directory monitoring and an intuitive web interface with batch processing capabilities.

## Features

- **Dual Mode Architecture**:
  - **Online Mode**: Web-based drag-and-drop interface with batch processing support
  - **Local Mode**: Automated filesystem watcher for background batch processing
- **Batch Processing**: Compress multiple images simultaneously with progress tracking
- **Format Conversion**: Support for converting to JPEG, PNG, WebP, and AVIF
- **Smart Compression**: Lossy compression algorithm that preserves visual quality
- **ZIP Downloads**: Download all compressed images as a single ZIP file
- **Modern UI**: Clean, responsive interface with glassmorphism design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Services**: Tinify API
- **Utilities**: Chokidar (File Watching), Multer (File Handling), Archiver (ZIP creation)
- **Frontend**: Vanilla HTML/CSS/JS with Lucide Icons

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A Tinify API key (see below for instructions)

### Getting Your Free Tinify API Key

1. **Visit TinyPNG Developers**: Go to [https://tinypng.com/developers](https://tinypng.com/developers)
2. **Sign Up**: Enter your email and name
3. **Verify Email**: Check your inbox for a verification email
4. **Get Your Key**: Once verified, you'll receive your API key
5. **Free Tier**: 500 compressions per month, completely free!

### Installation

1. **Star & Fork the repository**:
   - Visit [github.com/jackosei/image-compressor](https://github.com/jackosei/image-compressor)
   - Click ⭐ **Star** to show your support
   - Click **Fork** to create your own copy

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR-USERNAME/image-compressor.git
   cd image-compressor
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Configure Environment**:
   Create a `.env` file in the root directory with your Tinify API key:

   ```env
   TINIFY_KEY=your_api_key_from_tinypng
   # Optional: Set default mode (online/local)
   APP_MODE=online
   # Optional: Set local mode output format
   OUTPUT_FORMAT=original
   # Optional: Set port (default: 3000)
   PORT=3000
   ```

5. **Start the application**:

   ```bash
   npm start
   ```

6. **Access the web interface**:
   Navigate to `http://localhost:3000`

## Usage

### Online Mode (Default)

The web interface supports both single and batch image compression:

**Single File:**

1. Drag & drop or click to select an image
2. Choose output format (optional)
3. Download compressed image

**Batch Processing:**

1. Select multiple images (up to 20)
2. Watch real-time compression progress for each file
3. Download individually or all files as ZIP

### Local Mode

Enable automated directory monitoring:

```bash
APP_MODE=local npm start
```

- Place images in the `uploads/` directory
- Compressed files automatically appear in `converted/`
- Set output format via `OUTPUT_FORMAT` in `.env`

## Deployment

This app can be easily deployed to run locally or on platforms like **Render** or **Railway** with minimal configuration.

### Option 1: Run Locally

Follow the [Installation](#installation) instructions above to run the app on your local machine with your own API key.

### Option 2: Deploy to Render (Recommended)

Render offers a generous free tier perfect for Node.js applications.

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

4. **Configure Environment Variables**
   - In the Render dashboard, go to "Environment"
   - Add: `TINIFY_KEY` = `your_tinify_api_key`
   - `APP_MODE` is already set to `online` in render.yaml

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://your-app-name.onrender.com`

### Option 3: Deploy to Railway

Railway provides simple deployment with automatic HTTPS.

1. **Push to GitHub** (if not already done)

2. **Create Railway Account**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub

3. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js and configures build

4. **Add Environment Variables**
   - Go to "Variables" tab
   - Add: `TINIFY_KEY` = `your_tinify_api_key`
   - Add: `APP_MODE` = `online`
   - Add: `NODE_ENV` = `production`

5. **Generate Domain**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Your app is live!

### Post-Deployment

After deployment, test your app:

- ✅ Upload a single image
- ✅ Test batch processing (multiple images)
- ✅ Verify format conversion works
- ✅ Test ZIP download

### Free Tier Limitations

If you're hosting publicly with your personal API key, consider adding usage limits (as implemented in the app UI) to preserve your 500/month free Tinify credits.

## Project Structure

```
image-compressor/
├── src/
│   ├── server.js           # Main application entry
│   ├── modes/
│   │   ├── online.js       # Web interface routes
│   │   └── local.js        # Directory watcher
│   └── services/
│       └── tinifyService.js # Image compression logic
├── public/
│   ├── index.html          # Web UI
│   ├── script.js           # Frontend logic
│   └── style.css           # Styling
├── uploads/                # Input directory (local mode)
└── converted/              # Output directory (local mode)
```

## Configuration Options

| Variable        | Description                           | Default    |
| --------------- | ------------------------------------- | ---------- |
| `TINIFY_KEY`    | Your Tinify API key                   | Required   |
| `APP_MODE`      | Application mode: `online` or `local` | `online`   |
| `OUTPUT_FORMAT` | Local mode output format              | `original` |
| `PORT`          | Server port                           | `3000`     |

## API Limits

- **Free Tier**: 500 compressions/month
- **Batch Limit**: 20 images per batch
- **File Size**: Maximum 10MB per image
- **Supported Formats**: JPEG, PNG, WebP

## FAQ

**Q: Why is the hosted version limited to 5 compressions?**
A: To protect my personal API credits while offering a free demo.

**Q: How do I get unlimited compressions?**
A: Clone this repo, get your own free Tinify API key, and run it locally!

**Q: Can I process more than 20 images at once?**
A: When running locally, you can modify the batch limit in `src/modes/online.js`.

**Q: Is my data safe?**
A: Images are processed temporarily and automatically deleted. See our [Privacy Policy](#) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes!

---

**Built with ❤️ by [Jack Osei](https://jackosei.com)**

Get the code: [GitHub Repository](https://github.com/jackosei/image-compressor)
