import { LockKeyhole, Monitor, ShieldCheck } from 'lucide-react';
import Dashboard from './dashboard';
import { chatGPTSignInPath, getChatGPTUser } from './chatgpt-auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getChatGPTUser();

  if (user) return <Dashboard userName={user.displayName} />;

  return (
    <main className="login-page">
      <section className="login-intro">
        <a className="login-brand" href="/" aria-label="PC Hub Marketing home">
          <span className="brandmark"><Monitor size={23} /></span>
          <span>PC HUB<small>MARKETING WORKSPACE</small></span>
        </a>
        <div className="login-copy">
          <span className="login-kicker">DIGITAL MARKETING TEAM</span>
          <h1>One clear view of every post, plan and KPI.</h1>
          <p>PC Hub’s private workspace for posting monitoring, social content planning, analytics and team delivery.</p>
          <div className="login-points">
            <span><ShieldCheck size={17} /> Private team workspace</span>
            <span><LockKeyhole size={17} /> Secure account sign-in</span>
          </div>
        </div>
        <p className="login-footer">PC Hub Philippines · Digital Marketing</p>
      </section>
      <section className="login-panel-wrap">
        <div className="login-panel">
          <span className="login-icon"><LockKeyhole size={24} /></span>
          <h2>Welcome back</h2>
          <p>Sign in to open the PC Hub Marketing workspace.</p>
          <a className="login-button" href={chatGPTSignInPath('/')} target="_top">Sign in with ChatGPT</a>
          <small>Access is limited to approved workspace members.</small>
        </div>
      </section>
    </main>
  );
}
