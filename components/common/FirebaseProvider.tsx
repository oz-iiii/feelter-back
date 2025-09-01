import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import ReactDOM from 'react-dom/client';

// Firebase 설정은 여기에 입력해야 합니다.
// 이 아래 전체를 Firebase 콘솔에서 복사한 코드로 교체해야 합니다.
const firebaseConfig = {
    apiKey: "AIzaSyA0ElRpvChovQxE7057qJeoxqPGOC9FmDE",
    authDomain: "feelter-6d23c.firebaseapp.com",
    projectId: "feelter-6d23c",
    storageBucket: "feelter-6d23c.firebasestorage.app",
    messagingSenderId: "954168936325",
    appId: "1:954168936325:web:d9ee91c6e7fcbb06a766ec"
};

// 1. Firebase Context의 타입 정의
interface FirebaseContextType {
    auth: Auth | null;
    db: Firestore | null;
    authReady: boolean;
    error: string;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

// 2. Firebase Provider 컴포넌트
interface FirebaseProviderProps {
    children: ReactNode;
}

function FirebaseProvider({ children }: FirebaseProviderProps) {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [db, setDb] = useState<Firestore | null>(null);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
            setError('Firebase 설정 정보를 입력해 주세요.');
            return;
        }

        try {
            const app: FirebaseApp = initializeApp(firebaseConfig);
            const authInstance: Auth = getAuth(app);
            const dbInstance: Firestore = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (!user) {
                    try {
                        await signInAnonymously(authInstance);
                    } catch (e: unknown) {
                        console.error("Firebase 인증 오류:", e);
                        if (e instanceof Error) {
                            setError(`Firebase 인증에 실패했습니다: ${e.message}`);
                        } else {
                            setError('Firebase 인증에 실패했습니다: 알 수 없는 오류가 발생했습니다.');
                        }
                    }
                }
                setAuthReady(true);
            });
            return () => unsubscribe();
        } catch (e: unknown) {
            console.error("Firebase 초기화 오류:", e);
            if (e instanceof Error) {
                setError(`Firebase 초기화에 실패했습니다: ${e.message}`);
            } else {
                setError('Firebase 초기화에 실패했습니다: 알 수 없는 오류가 발생했습니다.');
            }
        }
    }, []);

    const value: FirebaseContextType = { auth, db, authReady, error };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
}

// 3. Firebase 인스턴스에 쉽게 접근하는 커스텀 훅
const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase 훅은 FirebaseProvider 안에서 사용해야 합니다.');
    }
    return context;
};

// 4. Provider를 사용하는 간단한 예시 컴포넌트
function WelcomeMessage() {
    const { authReady, error, auth } = useFirebase();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (auth && auth.currentUser) {
            setUserId(auth.currentUser.uid);
        }
    }, [auth]);

    if (error) {
        return (
            <div className="text-center p-6 rounded-md bg-red-100 text-red-700">
                {error}
            </div>
        );
    }

    if (!authReady) {
        return (
            <div className="text-center p-6 rounded-md bg-blue-100 text-blue-700">
                Firebase에 연결 중...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl max-w-lg mx-auto mt-10 text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">
                Firebase 연결 완료!
            </h1>
            <p className="text-gray-600">
                이제 다른 컴포넌트에서 <code className="bg-gray-200 rounded px-1">useFirebase()</code> 훅을 사용하여 Firestore에 접근할 수 있습니다.
            </p>
            {userId && (
                <div className="text-sm text-gray-500">
                    현재 사용자 ID: {userId}
                </div>
            )}
        </div>
    );
}

// 5. 전체 앱을 Provider로 감싸기
function App() {
    return (
        <FirebaseProvider>
            <WelcomeMessage />
        </FirebaseProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
