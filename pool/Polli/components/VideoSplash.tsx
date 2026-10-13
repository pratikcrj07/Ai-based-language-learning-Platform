import { theme } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const splashVideo = require("../assets/video/Polli_logo_animation_storyboard_20260917052509.mp4");

type VideoSplashProps = {
  onReady: () => void;
  onFinish: () => void;
};

export default function VideoSplash({ onReady, onFinish }: VideoSplashProps) {
  const player = useVideoPlayer(splashVideo, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
  });

  useEffect(() => {
    const ended = player.addListener("playToEnd", onFinish);
    const status = player.addListener("statusChange", ({ status }) => {
      if (status === "error") onFinish();
    });
    // The bundled animation is 10 seconds. Also recover from stalled loading
    // or blocked autoplay so the splash never prevents access to the app.
    const timeout = setTimeout(onFinish, 15000);

    if (player.status === "error") {
      onFinish();
    } else {
      player.play();
    }

    return () => {
      clearTimeout(timeout);
      ended.remove();
      status.remove();
    };
  }, [onFinish, player]);

  return (
    <View style={styles.container} accessibilityLabel="Polli is starting">
      <StatusBar hidden />
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        playsInline
        onFirstFrameRender={onReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: theme.color.surface,
    zIndex: 100,
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.color.surface,
  },
});
