#!/usr/bin/env bash
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo ".env file created from .env.example"
fi

echo "Installing dependencies via Homebrew..."
brew bundle

echo "Installing project dependencies..."
bun install

echo "Starting Supabase locally..."
supabase start
