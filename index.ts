global.net = require("react-native-tcp-socket");
global.tls = require("react-native-tcp-socket");
//shims for react-native
if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer;

import "./global.css";
import "expo-router/entry";
