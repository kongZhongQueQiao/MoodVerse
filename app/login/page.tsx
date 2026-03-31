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
  const [isCreating, setIsCreating] = useState(false);

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
        body: JSON.stringify({ email, password, action: isCreating ? "create" : "login" }),
      });

      const result: { success?: boolean; message?: string } = await response.json();

      if (response.ok && result.success) {
        showToast(isCreating ? "创建完成" : "登录成功");
        window.setTimeout(() => router.push("/"), 400);
        return;
      }

      showToast(result.message ?? (isCreating ? "创建失败" : "登录失败"));
    } catch {
      showToast("网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mv-auth-root">
      <div className="mv-auth-mask" />

      <p className="mv-auth-brand">★ MOODVERSE</p>

      <main className="mv-auth-card">
        <h1>{isCreating ? "创建您的星际身份" : "观星者，欢迎回来"}</h1>
        <p className="mv-auth-subtitle">{isCreating ? "收集您的星际邮箱与密码" : "开启您的星际情绪之旅"}</p>

        <form onSubmit={handleSubmit} className="mv-auth-form" noValidate>
          <label>
            {isCreating ? "收集邮箱" : "电子邮箱"}
            <span>{isCreating ? "用于创建新的星屿" : "示例账号"}</span>
          </label>
          <div className="mv-auth-input-wrap">
            <Mail size={14} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={isCreating ? "收集邮箱" : "example@gmail.com"}
            />
          </div>

          <label>
            {isCreating ? "收集密码" : "密码"}
            <span>{isCreating ? "至少6位字符" : "6位数字"}</span>
          </label>
          <div className="mv-auth-input-wrap">
            <Lock size={14} />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isCreating ? "收集密码" : "••••••"}
            />
          </div>

          {emailError ? <p className="mv-auth-error">{emailError}</p> : null}

          <button type="submit" className="mv-auth-submit" disabled={loading}>
            {loading ? (isCreating ? "创建中..." : "进入中...") : isCreating ? "创建宇宙" : "进入宇宙"}
          </button>
        </form>

        <div className="mv-auth-orbit">ORBITING</div>
        <p
          className="mv-auth-create"
          role="button"
          tabIndex={0}
          onClick={() => setIsCreating((previous) => !previous)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsCreating((previous) => !previous);
            }
          }}
        >
          {isCreating ? "取消创建，返回登录 →" : "创建新的星屿 →"}
        </p>
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
