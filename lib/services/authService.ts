import { supabase } from "../supabase";
import { User, AuthError } from "@supabase/supabase-js";
import {
  UserProfile,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
} from "../types/auth";

class AuthService {
  // 이메일/비밀번호로 회원가입
  async register(credentials: RegisterCredentials): Promise<UserProfile> {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      if (credentials.password.length < 6) {
        throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
      }

      // Supabase 회원가입
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              display_name: credentials.displayName,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("회원가입에 실패했습니다.");
      }

      // 사용자 프로필은 트리거에 의해 자동 생성됨
      const userProfile = await this.getUserProfile(authData.user.id);
      if (!userProfile) {
        // 트리거가 실행되지 않은 경우 수동으로 생성
        return await this.createUserProfile(authData.user, {
          displayName: credentials.displayName,
          nickname: credentials.displayName,
        });
      }

      return userProfile;
    } catch (error) {
      console.error("Registration error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // 이메일/비밀번호로 로그인
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("로그인에 실패했습니다.");
      }

      const userProfile = await this.getUserProfile(data.user.id);
      if (!userProfile) {
        // 프로필이 없으면 생성
        return await this.createUserProfile(data.user);
      }

      return userProfile;
    } catch (error) {
      console.error("Login error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Google로 로그인
  async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/community`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("로그아웃에 실패했습니다.");
    }
  }

  // 사용자 프로필 생성
  private async createUserProfile(
    user: User,
    additionalData?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const userProfile: UserProfile = {
      uid: user.id,
      email: user.email || null,
      displayName:
        user.user_metadata?.display_name ||
        additionalData?.displayName ||
        user.email?.split("@")[0],
      photoURL: user.user_metadata?.avatar_url,
      isAnonymous: false,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(),
      nickname:
        additionalData?.nickname ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0],
      bio: "",
      favoriteGenres: [],
      favoriteActors: [],
      favoriteDirectors: [],
      stats: {
        postsCount: 0,
        reviewsCount: 0,
        discussionsCount: 0,
        emotionsCount: 0,
        likesReceived: 0,
        commentsReceived: 0,
      },
      preferences: {
        notifications: {
          comments: true,
          likes: true,
          mentions: true,
          newPosts: false,
        },
        privacy: {
          showEmail: false,
          showStats: true,
        },
      },
      ...additionalData,
    };

    const { error } = await supabase.from("users").upsert([
      {
        id: user.id,
        email: userProfile.email,
        display_name: userProfile.displayName,
        nickname: userProfile.nickname,
        photo_url: userProfile.photoURL,
        bio: userProfile.bio,
        favorite_genres: userProfile.favoriteGenres,
        favorite_actors: userProfile.favoriteActors,
        favorite_directors: userProfile.favoriteDirectors,
        stats: userProfile.stats,
        preferences: userProfile.preferences,
        updated_at: userProfile.updatedAt.toISOString(),
      },
    ]);

    if (error) {
      console.error("Create user profile error:", error);
      throw error;
    }

    return userProfile;
  }

  // 사용자 프로필 조회
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows found
        throw error;
      }

      return {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        nickname: data.nickname,
        photoURL: data.photo_url,
        bio: data.bio,
        favoriteGenres: data.favorite_genres || [],
        favoriteActors: data.favorite_actors || [],
        favoriteDirectors: data.favorite_directors || [],
        stats: data.stats || {
          postsCount: 0,
          reviewsCount: 0,
          discussionsCount: 0,
          emotionsCount: 0,
          likesReceived: 0,
          commentsReceived: 0,
        },
        preferences: data.preferences || {
          notifications: {
            comments: true,
            likes: true,
            mentions: true,
            newPosts: false,
          },
          privacy: {
            showEmail: false,
            showStats: true,
          },
        },
        isAnonymous: false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as UserProfile;
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }

  // 사용자 프로필 업데이트
  async updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.displayName !== undefined)
        updateData.display_name = updates.displayName;
      if (updates.nickname !== undefined)
        updateData.nickname = updates.nickname;
      if (updates.photoURL !== undefined)
        updateData.photo_url = updates.photoURL;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.favoriteGenres !== undefined)
        updateData.favorite_genres = updates.favoriteGenres;
      if (updates.favoriteActors !== undefined)
        updateData.favorite_actors = updates.favoriteActors;
      if (updates.favoriteDirectors !== undefined)
        updateData.favorite_directors = updates.favoriteDirectors;
      if (updates.stats !== undefined) updateData.stats = updates.stats;
      if (updates.preferences !== undefined)
        updateData.preferences = updates.preferences;

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", uid);

      if (error) throw error;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error("프로필 업데이트에 실패했습니다.");
    }
  }

  // 프로필 이미지 업로드
  async uploadProfileImage(uid: string, file: File): Promise<string> {
    try {
      // 파일 이름 생성
      const fileExt = file.name.split(".").pop();
      const fileName = `${uid}/${Date.now()}.${fileExt}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 공개 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);

      // 프로필 업데이트
      await this.updateUserProfile(uid, { photoURL: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error("Upload profile image error:", error);
      throw new Error("프로필 이미지 업로드에 실패했습니다.");
    }
  }

  // 비밀번호 변경
  async changePassword(newPassword: string): Promise<void> {
    try {
      if (newPassword.length < 6) {
        throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Change password error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // 이메일 변경
  async changeEmail(newEmail: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Change email error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // 계정 삭제
  async deleteAccount(): Promise<void> {
    try {
      // 사용자가 작성한 모든 데이터를 삭제하는 RPC 함수 호출
      const { error } = await supabase.rpc("delete_user_account");

      if (error) throw error;
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("계정 삭제에 실패했습니다. 관리자에게 문의하세요.");
    }
  }

  // 인증 상태 변경 리스너
  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let userProfile = await this.getUserProfile(session.user.id);
        if (!userProfile) {
          userProfile = await this.createUserProfile(session.user);
        }
        callback(userProfile);
      } else {
        callback(null);
      }
    }).data.subscription;
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  // 에러 처리
  private handleAuthError(error: unknown): Error {
    const message = (error as { message?: string })?.message || "";

    if (message.includes("Invalid login credentials")) {
      return new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    if (message.includes("Email not confirmed")) {
      return new Error(
        "이메일 인증이 완료되지 않았습니다. 이메일을 확인하여 인증을 완료해주세요."
      );
    }
    if (message.includes("User already registered")) {
      return new Error("이미 사용 중인 이메일입니다.");
    }
    if (message.includes("Password should be at least 6 characters")) {
      return new Error("비밀번호는 최소 6자 이상이어야 합니다.");
    }
    if (message.includes("email_address_invalid")) {
      return new Error("올바르지 않은 이메일 형식입니다.");
    }
    if (message.includes("signup_disabled")) {
      return new Error("회원가입이 일시적으로 중단되었습니다.");
    }
    if (message.includes("too_many_requests")) {
      return new Error("너무 많은 시도를 했습니다. 잠시 후 다시 시도해주세요.");
    }

    return new Error(message || "인증 오류가 발생했습니다.");
  }
}

export const authService = new AuthService();
