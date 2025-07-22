#!/bin/bash

# Create the keystore file
keytool -genkeypair -v \
  -keystore app/release.keystore \
  -alias chatter-app \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass chatter123 \
  -keypass chatter123 \
  -dname "CN=sakooneqlab App, OU=Mobile Development, O=sakooneqlab, L=Your City, S=Your State, C=IN" 