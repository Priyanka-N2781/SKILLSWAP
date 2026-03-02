package com.skillswap.app.network;

import com.skillswap.app.models.Feedback;
import com.skillswap.app.models.Gamification;
import com.skillswap.app.models.Session;
import com.skillswap.app.models.Skill;
import com.skillswap.app.models.SkillRequest;
import com.skillswap.app.models.User;

import java.util.List;
import java.util.Map;

import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {
    
    // ==================== AUTH ====================
    
    @POST("auth/register")
    Call<Map<String, Object>> register(@Body Map<String, Object> request);
    
    @POST("auth/login")
    Call<User> login(@Query("email") String email, @Query("password") String password, 
                     @Query("rememberMe") boolean rememberMe);
    
    @POST("auth/login-with-token")
    Call<User> loginWithToken(@Body Map<String, String> body);
    
    @POST("auth/google-auth")
    Call<User> googleAuth(@Body Map<String, String> body);
    
    @POST("auth/github-auth")
    Call<User> githubAuth(@Body Map<String, String> body);
    
    @POST("auth/forgot-password")
    Call<Map<String, Object>> forgotPassword(@Body Map<String, String> body);
    
    @POST("auth/verify-reset-otp")
    Call<Map<String, Object>> verifyResetOtp(@Body Map<String, String> body);
    
    @POST("auth/reset-password")
    Call<Map<String, Object>> resetPassword(@Body Map<String, String> body);
    
    @POST("auth/verify-email-otp")
    Call<Map<String, Object>> verifyEmailOtp(@Body Map<String, String> body);
    
    @POST("auth/resend-email-otp")
    Call<Map<String, Object>> resendEmailOtp(@Body Map<String, String> body);
    
    @POST("auth/send-phone-otp")
    Call<Map<String, Object>> sendPhoneOtp(@Body Map<String, String> body);
    
    @POST("auth/verify-phone-otp")
    Call<Map<String, Object>> verifyPhoneOtp(@Body Map<String, String> body);
    
    @POST("auth/logout")
    Call<Map<String, Object>> logout();
    
    @GET("auth/me")
    Call<User> getCurrentUser();
    
    @PUT("auth/profile")
    Call<Map<String, Object>> updateProfile(@Body Map<String, Object> body);
    
    @PUT("auth/change-password")
    Call<Map<String, Object>> changePassword(@Body Map<String, String> body);
    
    // ==================== SKILLS ====================
    
    @GET("skills")
    Call<Map<String, Object>> getSkills(@Query("category") String category,
                                        @Query("level") String level,
                                        @Query("search") String search,
                                        @Query("sortBy") String sortBy,
                                        @Query("order") String order,
                                        @Query("page") int page,
                                        @Query("limit") int limit);
    
    @GET("skills/my-skills")
    Call<Map<String, Object>> getMySkills();
    
    @GET("skills/{id}")
    Call<Map<String, Object>> getSkill(@Path("id") String id);
    
    @POST("skills")
    Call<Map<String, Object>> addSkill(@Body Map<String, Object> body);
    
    @PUT("skills/{id}")
    Call<Map<String, Object>> updateSkill(@Path("id") String id, @Body Map<String, Object> body);
    
    @DELETE("skills/{id}")
    Call<Map<String, Object>> deleteSkill(@Path("id") String id);
    
    @GET("skills/meta/categories")
    Call<Map<String, Object>> getCategories();
    
    // ==================== SKILL REQUESTS ====================
    
    @POST("skill-requests")
    Call<Map<String, Object>> sendSkillRequest(@Body Map<String, Object> body);
    
    @GET("skill-requests/my-requests")
    Call<Map<String, Object>> getMyRequests();
    
    @GET("skill-requests/incoming")
    Call<Map<String, Object>> getIncomingRequests();
    
    @PUT("skill-requests/{id}/accept")
    Call<Map<String, Object>> acceptRequest(@Path("id") String id, @Body Map<String, Object> body);
    
    @PUT("skill-requests/{id}/reject")
    Call<Map<String, Object>> rejectRequest(@Path("id") String id, @Body Map<String, String> body);
    
    @PUT("skill-requests/{id}/cancel")
    Call<Map<String, Object>> cancelRequest(@Path("id") String id);
    
    @GET("skill-requests/{id}")
    Call<Map<String, Object>> getRequest(@Path("id") String id);
    
    // ==================== SESSIONS ====================
    
    @GET("sessions")
    Call<Map<String, Object>> getSessions(@Query("status") String status);
    
    @GET("sessions/upcoming")
    Call<Map<String, Object>> getUpcomingSessions();
    
    @GET("sessions/{id}")
    Call<Map<String, Object>> getSession(@Path("id") String id);
    
    @PUT("sessions/{id}")
    Call<Map<String, Object>> updateSession(@Path("id") String id, @Body Map<String, Object> body);
    
    @PUT("sessions/{id}/start")
    Call<Map<String, Object>> startSession(@Path("id") String id);
    
    @PUT("sessions/{id}/end")
    Call<Map<String, Object>> endSession(@Path("id") String id, @Body Map<String, String> body);
    
    @PUT("sessions/{id}/cancel")
    Call<Map<String, Object>> cancelSession(@Path("id") String id, @Body Map<String, String> body);
    
    @POST("sessions/{id}/feedback")
    Call<Map<String, Object>> addFeedback(@Path("id") String id, @Body Map<String, Object> body);
    
    // ==================== FEEDBACK ====================
    
    @GET("feedback/given")
    Call<Map<String, Object>> getGivenFeedback();
    
    @GET("feedback/received")
    Call<Map<String, Object>> getReceivedFeedback();
    
    @GET("feedback/{id}")
    Call<Map<String, Object>> getFeedback(@Path("id") String id);
    
    // ==================== GAMIFICATION ====================
    
    @GET("gamification/me")
    Call<Map<String, Object>> getMyGamification();
    
    @GET("gamification/leaderboard")
    Call<Map<String, Object>> getLeaderboard(@Query("limit") int limit);
    
    @GET("gamification/badges")
    Call<Map<String, Object>> getBadges();
    
    // ==================== HISTORY ====================
    
    @GET("history/sessions")
    Call<Map<String, Object>> getSessionHistory();
    
    @GET("history/requests")
    Call<Map<String, Object>> getRequestHistory(@Query("status") String status);
    
    @GET("history/my-skills")
    Call<Map<String, Object>> getMySkillsHistory();
    
    @GET("history/gamification")
    Call<Map<String, Object>> getGamificationHistory();
    
    @GET("history/summary")
    Call<Map<String, Object>> getHistorySummary();
    
    @GET("history/export-pdf")
    Call<Map<String, Object>> exportPdf();
    
    // ==================== PROFILE ====================
    
    @Multipart
    @POST("auth/profile-picture")
    Call<Map<String, Object>> uploadProfilePicture(@Part MultipartBody.Part image);
}
