@echo off
echo.
echo Installing Booth 33 Security Dependencies...
echo.

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Using npm to install packages...
echo.

REM Install core security dependencies
echo Installing core security packages...
call npm install react-native-dotenv
call npm install react-native-keychain
call npm install react-native-encrypted-storage
call npm install @stripe/stripe-react-native

echo.
echo Installing development tools...
call npm install --save-dev eslint prettier eslint-plugin-react eslint-plugin-react-native

echo.
echo Setting up environment files...

REM Create .env from .env.example if it doesn't exist
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Created .env from .env.example
        echo WARNING: Please edit .env and add your actual API keys!
    ) else (
        echo WARNING: .env.example not found
    )
) else (
    echo .env already exists
)

echo.
echo ================================
echo Installation complete!
echo ================================
echo.
echo Next steps:
echo 1. Edit .env and add your API keys
echo 2. Restart Metro bundler: npm start -- --clear
echo 3. Read SECURITY.md for security best practices
echo 4. Read SETUP.md for detailed setup instructions
echo.
echo Happy coding!
echo.
pause
