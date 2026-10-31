const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

/**
 * iOS 27 stops apps at launch unless they use the UIScene life cycle, and the SDK 57 template
 * doesn't adopt it yet. This switches the app to Expo's built-in `ExpoAppSceneDelegate`, which
 * creates the window and starts React Native from the scene instead of the app delegate.
 * Remove this plugin once `expo prebuild` generates the scene setup itself.
 */
module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

  return withAppDelegate(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (src.includes('ExpoReactNativeFactoryProvider')) return cfg;

    const header = 'class AppDelegate: ExpoAppDelegate {';
    const startBlock = /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;
    if (!src.includes(header) || !startBlock.test(src)) {
      throw new Error('withSceneLifecycle: AppDelegate.swift no longer matches the expected template.');
    }
    src = src.replace(header, 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
    // The scene delegate creates the window and starts React Native into it.
    src = src.replace(startBlock, '');
    cfg.modResults.contents = src;
    return cfg;
  });
};
