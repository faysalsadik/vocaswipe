@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot
set ANDROID_HOME=C:\android-sdk
cd /d E:\laragon\www\vocascroll\vocaswipe-app\android
gradlew.bat assembleDebug
