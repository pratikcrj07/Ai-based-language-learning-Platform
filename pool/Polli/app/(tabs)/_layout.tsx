import { Tabs } from "expo-router";
import {
  GraduationCap,
  LayoutDashboard,
  Settings,
  TrendingUp,
} from "lucide-react-native";
import React from "react";

const TabIcons = ({ focused, Icon }: any) => {
  return (
    <Icon size={24} color={focused ? "#5E5CE6" : "#9CA3AF"} strokeWidth={1.5} />
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#F9FAFB",
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Nunito",
        },
        tabBarActiveTintColor: "#5E5CE6",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} Icon={LayoutDashboard} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} Icon={GraduationCap} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} Icon={TrendingUp} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcons focused={focused} Icon={Settings} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
