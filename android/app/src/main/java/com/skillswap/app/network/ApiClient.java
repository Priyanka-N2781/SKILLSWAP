package com.skillswap.app.network;

import com.skillswap.app.utils.Config;
import com.skillswap.app.utils.SessionManager;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    
    // Use Config class for centralized URL management
    private static final String BASE_URL = Config.BASE_URL;
    
    private static Retrofit retrofit = null;
    private static ApiService apiService = null;
    
    public static ApiService getApiService() {
        if (apiService == null) {
            apiService = getClient().create(ApiService.class);
        }
        return apiService;
    }
    
    public static Retrofit getClient() {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(getHttpClient())
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
    
    private static OkHttpClient getHttpClient() {
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        
        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor(new Interceptor() {
                    @Override
                    public Response intercept(Chain chain) throws IOException {
                        Request original = chain.request();
                        
                        // Get token from session manager (we'll pass context later)
                        // For now, we'll add a header placeholder
                        Request.Builder requestBuilder = original.newBuilder()
                                .header("Content-Type", "application/json")
                                .header("Accept", "application/json");
                        
                        // Add Authorization header if token exists
                        // This will be handled by the ApiService with auth interceptor
                        
                        return chain.proceed(requestBuilder.build());
                    }
                })
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        
        return client;
    }
}