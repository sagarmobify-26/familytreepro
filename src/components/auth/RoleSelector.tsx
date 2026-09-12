import React, { useState } from 'react';
import {
  Crown,
  Users,
  Eye,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useFamily } from '../../store/familyContext';
import { UserRole } from '../../types/auth';

export const RoleSelector: React.FC = () => {
  const { handleEmailLogin, handleEmailSignUp, loginWithRole, members } = useFamily();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('head');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Demo Persona
  const [selectedPersona, setSelectedPersona] = useState<string>('mem-3');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'head') setSelectedPersona('mem-3'); // Rajendra
    else if (role === 'contributor') setSelectedPersona('mem-7'); // Rahul
    else if (role === 'viewer') setSelectedPersona('mem-13'); // Aarav
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!email.trim() || !password || !name.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        await handleEmailSignUp(email.trim(), password, name.trim(), selectedRole);
      } else if (authMode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await handleEmailLogin(email.trim(), password);
      } else {
        // Quick Demo
        loginWithRole(selectedRole, selectedPersona);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let msg = err?.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/configuration-not-found') {
        msg = 'Firebase Authentication is not yet enabled for project famil-c137b. In Firebase Console, go to Build > Authentication, click "Get Started", and enable Email/Password under Sign-in method.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify or use "Create Vault Account".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-bg-overlay" />

      <div className="login-card-container animate-fade-in">
        {/* Heritage Header */}
        <div className="login-branding-header">
          <div className="brand-badge-pill">
            <Sparkles size={13} className="text-amber-400" />
            <span>ARCHIVAL HERITAGE</span>
          </div>

          <h1 className="vault-brand-title">KinTree</h1>
          <p className="vault-family-tag">Shah Family Heritage • Est. 1928</p>

          <div className="divider-gold" />

          <h2 className="login-headline">
            {authMode === 'signup'
              ? 'Create Family Vault Account'
              : authMode === 'signin'
              ? 'Sign in with Firebase Auth'
              : 'Quick Demo Access'}
          </h2>
          <p className="login-subtext">
            Connected to Firebase backend project <strong>famil-c137b</strong>.
          </p>
        </div>

        {/* Tab switch between Email Sign In, Sign Up, and Quick Demo */}
        <div className="flex border-b border-slate-200 mb-6 justify-center gap-4">
          <button
            type="button"
            className={`pb-2 px-3 text-xs font-bold transition-all ${
              authMode === 'signin'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => {
              setAuthMode('signin');
              setAuthError(null);
            }}
          >
            Email Sign In
          </button>
          <button
            type="button"
            className={`pb-2 px-3 text-xs font-bold transition-all ${
              authMode === 'signup'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => {
              setAuthMode('signup');
              setAuthError(null);
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`pb-2 px-3 text-xs font-bold transition-all ${
              authMode === 'demo'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => {
              setAuthMode('demo');
              setAuthError(null);
            }}
          >
            Quick Persona Demo
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium animate-fade-in">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="login-form-body">
          {/* Role Cards Grid (shown in signup and demo modes) */}
          {(authMode === 'signup' || authMode === 'demo') && (
            <div className="mb-4">
              <label className="form-label font-medium mb-2">Select Your Role in Vault:</label>
              <div className="role-cards-grid">
                {/* Family Head */}
                <div
                  className={`role-select-card ${selectedRole === 'head' ? 'active-head' : ''}`}
                  onClick={() => handleRoleChange('head')}
                >
                  <div className="role-icon-box icon-head">
                    <Crown size={20} />
                  </div>
                  <h3 className="role-name">Family Head</h3>
                  <p className="role-tagline">Manage vault & tree</p>
                  <div className="role-capability-badge">Full Authority</div>
                </div>

                {/* Branch Contributor */}
                <div
                  className={`role-select-card ${selectedRole === 'contributor' ? 'active-contributor' : ''}`}
                  onClick={() => handleRoleChange('contributor')}
                >
                  <div className="role-icon-box icon-contributor">
                    <Users size={20} />
                  </div>
                  <h3 className="role-name">Branch Contributor</h3>
                  <p className="role-tagline">Maintain your branch</p>
                  <div className="role-capability-badge">Branch Editor</div>
                </div>

                {/* Family Viewer */}
                <div
                  className={`role-select-card ${selectedRole === 'viewer' ? 'active-viewer' : ''}`}
                  onClick={() => handleRoleChange('viewer')}
                >
                  <div className="role-icon-box icon-viewer">
                    <Eye size={20} />
                  </div>
                  <h3 className="role-name">Family Viewer</h3>
                  <p className="role-tagline">Explore history</p>
                  <div className="role-capability-badge">Read Only</div>
                </div>
              </div>
            </div>
          )}

          {/* Email / Password Fields */}
          {authMode !== 'demo' ? (
            <div className="space-y-3 mb-6">
              {authMode === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      className="form-input pl-9"
                      placeholder="e.g. Rajendra Shah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    className="form-input pl-9"
                    placeholder="e.g. rajendra.shah@kintree.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    className="form-input pl-9"
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Persona Preview for Quick Demo */
            <div className="persona-preview-box mb-6">
              <div className="persona-info-left">
                <div className="persona-avatar">
                  {members[selectedPersona]?.profileImage ? (
                    <img
                      src={members[selectedPersona].profileImage}
                      alt={members[selectedPersona].firstName}
                    />
                  ) : (
                    <span>{members[selectedPersona]?.firstName[0] || 'U'}</span>
                  )}
                </div>
                <div>
                  <div className="persona-name">
                    {members[selectedPersona]?.firstName} {members[selectedPersona]?.lastName}
                  </div>
                  <div className="persona-role-meta">
                    {selectedRole === 'head' && 'Family Head • Generation II'}
                    {selectedRole === 'contributor' && 'Branch Contributor • Generation III'}
                    {selectedRole === 'viewer' && 'Family Member • Generation IV'}
                  </div>
                </div>
              </div>

              <div className="security-validation-tag">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Demo Preset</span>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button type="submit" className="btn-enter-vault" disabled={loading}>
            <span>
              {loading
                ? 'Authenticating...'
                : authMode === 'signup'
                ? 'Create Account & Enter Vault'
                : authMode === 'signin'
                ? 'Sign in to Family Vault'
                : 'Enter Vault with Persona'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <BookOpen size={13} className="text-slate-400" />
          <span>Firebase Project: famil-c137b • KinTree Protocol v5.3</span>
        </div>
      </div>
    </div>
  );
};
