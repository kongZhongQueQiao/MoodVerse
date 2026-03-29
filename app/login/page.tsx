"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

type ToastState = {
  message: string;
  visible: boolean;
};

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("example@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

  const emailError = useMemo(() => {
    if (!email) return "";
    return EMAIL_REGEX.test(email) ? "" : "请输入有效的电子邮箱";
  }, [email]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    window.setTimeout(() => {
      setToast((previous) => ({ ...previous, visible: false }));
    }, 2200);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      showToast("邮箱格式不正确");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result: { success?: boolean; message?: string } = await response.json();

      if (response.ok && result.success) {
        router.push("/");
        return;
      }

      showToast(result.message ?? "登录失败");
    } catch {
      showToast("网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mv-auth-root">
      <div className="mv-auth-mask" />

      <main className="mv-auth-card">
        <p className="mv-auth-brand">★ MOODVERSE</p>
        <h1>观星者，欢迎回来</h1>
        <p className="mv-auth-subtitle">开启您的星际情绪之旅</p>

        <form onSubmit={handleSubmit} className="mv-auth-form" noValidate>
          <label>
            电子邮箱
            <span>示例账号</span>
          </label>
          <div className="mv-auth-input-wrap">
            <Mail size={14} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
            />
          </div>

          <label>
            密码
            <span>6位数字</span>
          </label>
          <div className="mv-auth-input-wrap">
            <Lock size={14} />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
            />
          </div>

          {emailError ? <p className="mv-auth-error">{emailError}</p> : null}

          <button type="submit" className="mv-auth-submit" disabled={loading}>
            {loading ? "进入中..." : "进入宇宙"}
          </button>
        </form>

        <div className="mv-auth-orbit">ORBITING</div>
        <p className="mv-auth-create">创建新的星屿 →</p>
      </main>

      <div className="mv-auth-bottom">
        <footer className="mv-auth-footer">
          <div>
            <span>LATENCY</span>
            <strong>24ms</strong>
          </div>
          <div>
            <span>REGION</span>
            <strong>NEBULA-7</strong>
          </div>
          <div>
            <span>SECURE</span>
            <strong>P-SSL v4</strong>
          </div>
        </footer>

        <section className="mv-auth-legal" aria-label="底部法律信息">
          <div className="mv-auth-links">
            <span>PRIVACY POLICY</span>
            <span>TERMS OF SERVICE</span>
            <span>SUPPORT</span>
          </div>
          <p>MOODVERSE ANALYTICS PROTOCOL</p>
          <small>© 2026 MOODVERSE. ALL RIGHTS RESERVED.</small>
        </section>
      </div>

      <p className={`mv-auth-toast ${toast.visible ? "show" : ""}`}>{toast.message}</p>
    </div>
  );
}
