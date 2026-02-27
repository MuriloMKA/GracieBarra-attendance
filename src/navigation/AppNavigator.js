import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../constants/theme";

// Screens
import LoginScreen from "../screens/LoginScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentProfileScreen from "../screens/StudentProfileScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminStudentsScreen from "../screens/AdminStudentsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Student Tabs
const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="StudentHome"
        component={StudentHomeScreen}
        options={{
          tabBarLabel: "Check-in",
          tabBarIcon: ({ color }) => <TabIcon icon="✓" color={color} />,
        }}
      />
      <Tab.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Tabs
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminStudents"
        component={AdminStudentsScreen}
        options={{
          tabBarLabel: "Alunos",
          tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Simple tab icon component
const TabIcon = ({ icon, color }) => {
  return <span style={{ fontSize: 24, color }}>{icon}</span>;
};

// Main Navigator
const AppNavigator = () => {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!signed ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.type === "admin" ? (
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
        ) : (
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
