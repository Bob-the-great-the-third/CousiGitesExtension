@echo off
setlocal enabledelayedexpansion

echo ============================================
echo Extension Configuration Script
echo ============================================
echo.
echo Tutorial to get your API key on:
echo https://github.com/Bob-the-great-the-third/CousiGitesExtension/releases/tag/v2.2
echo.
set /p API_KEY="Enter your API key -> "

if "!API_KEY!"=="" (
    echo Error: API key cannot be empty
    pause
    exit /b 1
)

echo.
echo Updating configuration...

REM Create private directory if it doesn't exist
if not exist "private" mkdir private

REM Define your template JSON (modify as needed)
set "JSON_FILE=private/data.json"

REM Create/overwrite the JSON file with the API key
(
echo {
echo   "API_KEY": "!API_KEY!"
echo }
) > "%JSON_FILE%"

echo.
echo Configuration updated successfully!
echo API key has been set in %JSON_FILE%
echo.

echo.
echo ============================================
echo.

echo Set the list of locations your extension uses will use as default (upon setting and resetting the extension^)
echo Entry should be a Javascript list containing objects alike:
echo [
echo   {
echo     location: "location_name",
echo     x: "latitude",
echo     y: "longitude"
echo   }
echo ]
echo Coordinates should be in Decimal Degrees (DD^)
echo More coordinates system are accepted on the extension panel,
echo but these location won't be saved if you uninstall the extension
echo (Do note that the current changes aren't saved upon deletion and the only way to port this is by copy/pasting the private folder^)
echo.
echo.
echo Enter your JSON list (can be multi-line^). Type END on a new line when finished:
echo.

REM Create temporary file for multi-line input
set "TEMP_FILE=temp_locations.txt"
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

:input_loop
set "LINE="
set /p LINE="> "
if /i "!LINE!"=="END" goto :done_input
if /i "!LINE!"=="" goto :done_input
if /i "!LINE!"=="[" goto input_loop
echo !LINE!>> "%TEMP_FILE%"
goto :input_loop

:done_input

REM Check if file exists and has content
if not exist "%TEMP_FILE%" (
    echo No Json list added
    pause
    exit /b 1
)

REM Define your template JS file
set "METHODS_FILE=private/methods.js"

REM Create/overwrite the JS file with the locations
echo window.PRIVATE_METHODS = window.PRIVATE_METHODS ^|^| {}; > "%METHODS_FILE%"
echo. >> "%METHODS_FILE%"
echo window.PRIVATE_METHODS.default_locations = function() { >> "%METHODS_FILE%"
echo     return [ >> "%METHODS_FILE%"

REM Append the contents of the temp file
type "%TEMP_FILE%" >> "%METHODS_FILE%"

REM Close the function
echo } >> "%METHODS_FILE%"

REM Clean up temp file
del "%TEMP_FILE%"

echo.
echo Configuration completed successfully!
echo Locations have been set in %METHODS_FILE%
echo.
pause