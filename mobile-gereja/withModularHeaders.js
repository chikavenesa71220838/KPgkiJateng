const { withPodfile } = require('expo/config-plugins');

module.exports = function withModularHeaders(config) {
  return withPodfile(config, (config) => {
    let podfile = config.modResults.contents;

    // FIX 1: Tambahkan use_modular_headers! kalau belum ada
    if (!podfile.includes('use_modular_headers!')) {
      podfile = podfile.replace(
        /platform :ios, .*/,
        (match) => `${match}\nuse_modular_headers!`
      );
    }

    // FIX 2: Matikan Error "Non-Modular Includes" (Ini solusi untuk error barumu)
    const compilerFix = `
      installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    `;

    // Kita selipkan kode di atas ke dalam blok post_install
    if (!podfile.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
      podfile = podfile.replace(
        'post_install do |installer|',
        `post_install do |installer|${compilerFix}`
      );
    }

    config.modResults.contents = podfile;
    return config;
  });
};