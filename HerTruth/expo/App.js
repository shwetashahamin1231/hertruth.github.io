import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import { Linking, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// The whole HerTruth site as one string, generated from the tested build by site_v3/source/sync_apps.py.
// The quiz logic, scoring and iron model are the same code that runs on the website.
import SITE from './web/site';

const PAPER = '#FFFBFC';

// window.print() does nothing inside an app, so the page's Print button sends the result summary here instead.
// Photos live in the page's memory as blob: links, which the print renderer cannot open, so each one is copied in
// as a smaller JPEG. Buttons marked noprint are left out.
const PRINT_HOOK = `
window.print = function () {
  var root = document.getElementById('result'); if (!root) return;
  var clone = root.cloneNode(true), live = root.querySelectorAll('img'), copies = clone.querySelectorAll('img');
  for (var k = 0; k < live.length; k++) {
    var img = live[k]; if (!/^blob:/.test(img.src) || !img.naturalWidth) continue;
    var s = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); copies[k].src = c.toDataURL('image/jpeg', 0.82);
  }
  clone.querySelectorAll('.noprint').forEach(function (n) { n.remove(); });
  var css = Array.prototype.map.call(document.querySelectorAll('style'), function (s) { return s.outerHTML; }).join('');
  var h = document.documentElement;
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'print',
    html: '<!DOCTYPE html><html lang="' + h.lang + '" dir="' + h.dir + '"><head><meta charset="utf-8">' + css + '</head><body>' + clone.outerHTML + '</body></html>' }));
};
true;`;

export default function App() {
  // Keep the app on its own page; web, email and phone links open in Safari, Mail or Phone.
  const onShouldStartLoadWithRequest = (request) => {
    if (/^(https?|mailto|tel):/i.test(request.url)) {
      Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  const onMessage = async (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'print') await Print.printAsync({ html: msg.html });
    } catch (e) {
      // the person closed the print sheet, or the message was not ours
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <WebView
          style={styles.web}
          source={{ html: SITE }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          injectedJavaScriptBeforeContentLoaded={PRINT_HOOK}
          onMessage={onMessage}
          allowsBackForwardNavigationGestures={false}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAPER },
  web: { flex: 1, backgroundColor: PAPER },
});
