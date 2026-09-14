@echo off
chcp 936 >nul
title 梨花诗 · 试玩广告作品集 - 本地启动
cd /d "%~dp0"

echo.
echo  ==================================================
echo    梨花诗 · 试玩广告作品集   本地一键启动
echo  ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto NONODE
for /f "delims=" %%v in ('node -v') do set NODEVER=%%v
echo  [1/3] Node.js %NODEVER%   OK

if exist "node_modules\vite" goto HAVE_DEPS
echo.
echo  [2/3] 首次运行, 正在安装依赖, 需要联网, 可能要几分钟...
echo.
call npm install
if errorlevel 1 goto INSTALLFAIL
echo.
echo        依赖安装完成.
goto DEPS_OK

:HAVE_DEPS
echo  [2/3] 依赖已就绪   OK

:DEPS_OK
echo  [3/3] 正在启动本地服务, 稍等几秒浏览器会自动打开...
echo.
echo  --------------------------------------------------
echo    关掉这个黑色窗口 = 停止服务
echo  --------------------------------------------------
echo.

call npm run dev -- --open

echo.
echo  本地服务已停止.
echo.
pause
exit /b 0

:NONODE
echo  [X] 没有检测到 Node.js
echo.
echo      请先安装 Node.js 18 或更高版本: https://nodejs.org/
echo      装好之后重新双击本文件即可.
echo.
pause
exit /b 1

:INSTALLFAIL
echo.
echo  [X] 依赖安装失败, 请检查网络后重试.
echo.
pause
exit /b 1
