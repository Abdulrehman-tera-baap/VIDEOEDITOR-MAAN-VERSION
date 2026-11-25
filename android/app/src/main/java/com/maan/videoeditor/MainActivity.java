package com.maan.videoeditor;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.*;
import android.graphics.Color;

public class MainActivity extends Activity {
  private WebView web; private ValueCallback<Uri[]> upload;
  private static final int PICK_FILE=77;
  @Override public void onCreate(Bundle b){super.onCreate(b);
    getWindow().setStatusBarColor(Color.rgb(8,12,29)); getWindow().setNavigationBarColor(Color.rgb(8,12,29));
    web=new WebView(this); setContentView(web);
    WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setMediaPlaybackRequiresUserGesture(false);
    web.setWebChromeClient(new WebChromeClient(){
      @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params){
        if(upload!=null)upload.onReceiveValue(null); upload=cb;
        Intent i=params.createIntent(); try{startActivityForResult(i,PICK_FILE);}catch(Exception e){upload=null;return false;} return true;
      }
    });
    web.setWebViewClient(new WebViewClient()); web.loadUrl("file:///android_asset/www/index.html");
  }
  @Override protected void onActivityResult(int req,int res,Intent data){super.onActivityResult(req,res,data);if(req==PICK_FILE&&upload!=null){Uri[] r=WebChromeClient.FileChooserParams.parseResult(res,data);upload.onReceiveValue(r);upload=null;}}
  @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}