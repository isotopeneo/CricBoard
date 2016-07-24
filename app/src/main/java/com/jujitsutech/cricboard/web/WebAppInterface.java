package com.jujitsutech.cricboard.web;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;

/**
 * Created by elamgodilj on 7/17/16.
 */

public class WebAppInterface {

    private Context mContext;
    private final String TAG = WebAppInterface.class.getSimpleName();
    private final String FILENAME = "cricBoard.csv";

    /** Instantiate the interface and set the context */
    public WebAppInterface(Context c) {
        mContext = c;
    }

    /** Show a toast from the web page */
    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mContext, toast, Toast.LENGTH_LONG).show();
    }


    @JavascriptInterface
    public void sendCsv(String csvString) {
        Log.e(TAG, "csv value is " + csvString);
        if (!TextUtils.isEmpty(csvString)) saveFile(csvString);
        shareFile();
    }

    public void shareFile() {
        File file = new File(mContext.getExternalFilesDir(Environment.DIRECTORY_NOTIFICATIONS), FILENAME);
        if (!file.exists()) return;
        Intent emailIntent = new Intent(android.content.Intent.ACTION_SEND);
        emailIntent.setType("application/csv");
        emailIntent.putExtra(android.content.Intent.EXTRA_EMAIL, new String[] {""});
        emailIntent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(file));

        mContext.startActivity(Intent.createChooser(emailIntent, "Share..."));
    }

    public void saveFile(String csvString) {
        File file = new File(mContext.getExternalFilesDir(Environment.DIRECTORY_NOTIFICATIONS), FILENAME);
        FileOutputStream outputStream;
        try {
            outputStream = new FileOutputStream(file);
            outputStream.write(csvString.getBytes());
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, e.getMessage());
        }
    }
}
