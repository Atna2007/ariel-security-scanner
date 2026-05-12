#!/bin/bash
echo "Building Ariel Security Scanner..."
cd ..
npm run build
echo "Starting web interface..."
cd web
npm start