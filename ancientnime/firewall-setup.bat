@echo off
echo Setting up Windows Firewall for Node.js server...
echo.

REM Allow Node.js through Windows Firewall
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3002

REM Allow Node.js executable
netsh advfirewall firewall add rule name="Node.js App" dir=in action=allow program="C:\Program Files\nodejs\node.exe"

echo.
echo Firewall rules added successfully!
echo Your server should now be accessible from mobile devices on the same network.
echo.
echo Try accessing from your phone:
echo http://192.168.226.1:3002
echo http://192.168.160.1:3002
echo http://192.168.1.10:3002
echo.
pause
