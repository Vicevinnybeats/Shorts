import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("swangle"); // CPU WebGL (SwiftShader) on GitHub runners
Config.setConcurrency(null);
