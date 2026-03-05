import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiUser, FiCamera, FiMail, FiPhone, FiHash, FiAward,
  FiTrash2, FiUpload, FiBriefcase, FiBook, FiStar,
  FiTrendingUp, FiCheckCircle, FiXCircle, FiZoomIn, FiZoomOut,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

/* ─── All rules scoped under .profile-container to avoid leaking into dashboard ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .profile-container { max-width:1200px; margin:0 auto; padding:24px; font-family:'Plus Jakarta Sans',sans-serif; }

  .profile-container .profile-header { margin-bottom:32px; }
  .profile-container .profile-header h1 { display:flex; align-items:center; gap:12px; font-size:28px; font-weight:700; color:#1e293b; margin:0 0 8px 0; }
  .profile-container .profile-header p  { color:#64748b; margin:0; font-size:15px; }

  .profile-container .profile-content { display:grid; grid-template-columns:320px 1fr; gap:24px; align-items:start; }

  /* Profile Card */
  .profile-container .profile-card { background:white; border-radius:20px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04); border:1px solid #eef2f6; transition:box-shadow .2s; }
  .profile-container .profile-card:hover { box-shadow:0 8px 30px -4px rgba(0,0,0,.12); }

  .profile-container .profile-picture-section { position:relative; padding:40px 24px 28px; background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%); display:flex; flex-direction:column; align-items:center; }
  .profile-container .profile-picture-wrapper { position:relative; margin-bottom:16px; }
  .profile-container .profile-picture { width:150px; height:150px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:52px; border:5px solid rgba(255,255,255,.9); box-shadow:0 6px 24px rgba(0,0,0,.25); overflow:hidden; background-color:#6366f1; }
  .profile-container .profile-image   { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .profile-container .online-status   { position:absolute; bottom:8px; right:8px; width:18px; height:18px; background:#10b981; border:3px solid white; border-radius:50%; }

  .profile-container .picture-actions { display:flex; gap:8px; margin-top:4px; }
  .profile-container .picture-action-btn { width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,.95); border:none; display:flex; align-items:center; justify-content:center; color:#64748b; cursor:pointer; transition:all .2s; position:relative; box-shadow:0 2px 8px rgba(0,0,0,.15); }
  .profile-container .picture-action-btn:hover:not(:disabled) { transform:scale(1.1); }
  .profile-container .upload-btn:hover:not(:disabled) { background:#2563eb; color:white; }
  .profile-container .delete-btn:hover:not(:disabled)  { background:#ef4444; color:white; }
  .profile-container .picture-action-btn:disabled { opacity:.5; cursor:not-allowed; }

  .profile-container .action-tooltip { position:absolute; bottom:-36px; left:50%; transform:translateX(-50%); background:#1e293b; color:white; font-size:11px; font-weight:500; padding:4px 8px; border-radius:6px; white-space:nowrap; opacity:0; visibility:hidden; transition:opacity .2s; pointer-events:none; z-index:20; }
  .profile-container .action-tooltip::before { content:''; position:absolute; top:-4px; left:50%; transform:translateX(-50%); border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:4px solid #1e293b; }
  .profile-container .picture-action-btn:hover .action-tooltip { opacity:1; visibility:visible; }

  .profile-container .delete-confirm { display:flex; gap:4px; background:rgba(255,255,255,.95); border-radius:30px; padding:3px; box-shadow:0 2px 10px rgba(0,0,0,.15); }
  .profile-container .confirm-btn    { width:34px; height:34px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
  .profile-container .confirm-yes    { background:#10b981; color:white; }
  .profile-container .confirm-yes:hover:not(:disabled) { background:#059669; }
  .profile-container .confirm-no     { background:#ef4444; color:white; }
  .profile-container .confirm-no:hover:not(:disabled)  { background:#dc2626; }

  .profile-container .profile-info     { padding:20px 24px 24px; text-align:center; }
  .profile-container .profile-name     { margin:0 0 4px 0; font-size:22px; font-weight:700; color:#1e293b; }
  .profile-container .profile-username { margin:0 0 14px 0; color:#94a3b8; font-size:14px; }
  .profile-container .profile-badges   { display:flex; gap:6px; justify-content:center; margin-bottom:20px; flex-wrap:wrap; }
  .profile-container .profile-stats    { display:flex; flex-direction:column; gap:14px; padding-top:16px; border-top:1px solid #f1f5f9; }

  .profile-container .stat-item    { display:flex; align-items:center; gap:12px; padding:10px 12px; background:#f8fafc; border-radius:10px; text-align:left; }
  .profile-container .stat-icon    { color:#6366f1; width:18px; height:18px; flex-shrink:0; }
  .profile-container .stat-content { display:flex; flex-direction:column; gap:1px; min-width:0; }
  .profile-container .stat-label   { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#94a3b8; }
  .profile-container .stat-value   { font-size:13px; font-weight:500; color:#334155; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* Details Card */
  .profile-container .details-card      { background:white; border-radius:20px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04); border:1px solid #eef2f6; }
  .profile-container .details-header    { margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #f1f5f9; }
  .profile-container .details-header h3 { margin:0; font-size:18px; font-weight:700; color:#1e293b; }
  .profile-container .details-grid      { display:flex; flex-direction:column; gap:24px; }
  .profile-container .detail-section    { background:#f8fafc; border-radius:16px; padding:20px; }
  .profile-container .section-title     { margin:0 0 16px 0; font-size:14px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.05em; }
  .profile-container .info-grid         { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  .profile-container .info-item         { display:flex; gap:12px; align-items:flex-start; padding:12px; background:white; border-radius:12px; border:1px solid #eef2f6; transition:box-shadow .15s; }
  .profile-container .info-item:hover   { box-shadow:0 2px 8px rgba(0,0,0,.06); }
  .profile-container .info-icon         { color:#6366f1; margin-top:2px; flex-shrink:0; width:16px; height:16px; }
  .profile-container .info-content      { flex:1; min-width:0; }
  .profile-container .info-label        { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; margin-bottom:3px; }
  .profile-container .info-value        { font-size:14px; font-weight:500; color:#1e293b; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* Stats */
  .profile-container .stats-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .profile-container .stats-card  { background:white; border-radius:14px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.05); border:1px solid #eef2f6; transition:all .2s; }
  .profile-container .stats-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,.07); }
  .profile-container .stats-card-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .profile-container .stats-icon  { width:18px; height:18px; flex-shrink:0; }
  .profile-container .stats-icon.success { color:#10b981; }
  .profile-container .stats-icon.warning { color:#f59e0b; }
  .profile-container .stats-icon.danger  { color:#ef4444; }
  .profile-container .stats-icon.info    { color:#3b82f6; }
  .profile-container .stats-icon.neutral { color:#94a3b8; }
  .profile-container .stats-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#94a3b8; letter-spacing:.05em; }
  .profile-container .stats-value { font-size:26px; font-weight:700; color:#1e293b; margin-bottom:2px; line-height:1.1; }
  .profile-container .stats-value.success { color:#10b981; }
  .profile-container .stats-value.warning { color:#f59e0b; }
  .profile-container .stats-value.danger  { color:#ef4444; }
  .profile-container .stats-footer { font-size:11px; color:#94a3b8; font-weight:500; }

  /* Badges */
  .profile-container .badge         { padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:inline-block; }
  .profile-container .badge-primary { background:#ede9fe; color:#5b21b6; }
  .profile-container .badge-info    { background:#dbeafe; color:#1e40af; }
  .profile-container .badge-pink    { background:#fce7f3; color:#9d174d; }
  .profile-container .badge-success { background:#d1fae5; color:#065f46; }
  .profile-container .badge-warning { background:#fef3c7; color:#92400e; }
  .profile-container .badge-danger  { background:#fee2e2; color:#991b1b; }
  .profile-container .badge-purple  { background:#ede9fe; color:#6d28d9; }
  .profile-container .badge-neutral { background:#f1f5f9; color:#475569; }

  @keyframes pc-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .profile-container .spin { animation:pc-spin .8s linear infinite; }

  @media (max-width:900px) { .profile-container .profile-content { grid-template-columns:1fr; } }
  @media (max-width:600px) {
    .profile-container .info-grid   { grid-template-columns:1fr; }
    .profile-container .stats-cards { grid-template-columns:1fr; }
  }

  /* ── Crop Modal — global (overlay must cover full viewport) ── */
  .pc-crop-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.75); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:16px;
  }
  .pc-crop-modal {
    background:white; border-radius:20px; overflow:hidden;
    width:100%; max-width:600px;
    box-shadow:0 24px 64px rgba(0,0,0,.4);
    display:flex; flex-direction:column;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .pc-crop-header { padding:18px 20px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; }
  .pc-crop-header h3 { margin:0; font-size:16px; font-weight:700; color:#1e293b; }
  .pc-crop-close { background:none; border:none; cursor:pointer; color:#94a3b8; padding:4px; border-radius:8px; transition:all .15s; display:flex; }
  .pc-crop-close:hover { background:#f1f5f9; color:#1e293b; }

  .pc-crop-canvas-wrap {
    position:relative; overflow:hidden; background:#0f172a;
    height:480px; cursor:grab; user-select:none;
  }
  .pc-crop-canvas-wrap:active { cursor:grabbing; }
  .pc-crop-canvas { display:block; width:100%; height:100%; }

  .pc-crop-overlay-ring { position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; }
  .pc-crop-overlay-ring::before { content:''; width:420px; height:420px; border-radius:50%; box-shadow:0 0 0 9999px rgba(0,0,0,.55); border:2.5px solid rgba(255,255,255,.8); }

  .pc-crop-controls { padding:14px 20px; display:flex; align-items:center; gap:10px; border-top:1px solid #f1f5f9; background:#f8fafc; }
  .pc-crop-controls span { font-size:12px; color:#64748b; font-weight:600; }
  .pc-zoom-btn { width:32px; height:32px; border-radius:8px; border:1px solid #e2e8f0; background:white; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#475569; transition:all .15s; }
  .pc-zoom-btn:hover { background:#6366f1; color:white; border-color:#6366f1; }
  .pc-zoom-slider { flex:1; accent-color:#6366f1; cursor:pointer; }

  .pc-crop-actions { padding:14px 20px; display:flex; gap:10px; justify-content:flex-end; }
  .pc-btn { padding:9px 20px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif; }
  .pc-btn-ghost   { background:#f1f5f9; color:#475569; }
  .pc-btn-ghost:hover   { background:#e2e8f0; }
  .pc-btn-primary { background:#6366f1; color:white; display:flex; align-items:center; gap:6px; }
  .pc-btn-primary:hover { background:#4f46e5; }
  .pc-btn-primary:disabled { opacity:.6; cursor:not-allowed; }
`;

/* ════════════════════════════════════
   Crop Modal
════════════════════════════════════ */
function CropModal({ imageSrc, onConfirm, onCancel, uploading }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(new Image());
  const state     = useRef({ x:0, y:0, zoom:1, dragging:false, lastX:0, lastY:0 });
  const [zoom, setZoom] = useState(1);
  const CIRCLE = 420; // crop circle diameter in canvas px

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y, zoom: z } = state.current;
    const img = imgRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.naturalWidth * z, img.naturalHeight * z);
  }, []);

  /* Load & centre image */
  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Fit the whole image inside the canvas so user sees everything first
      const scaleW = canvas.width  / img.naturalWidth;
      const scaleH = canvas.height / img.naturalHeight;
      const z = Math.min(scaleW, scaleH) * 0.95; // slight padding
      const iw = img.naturalWidth  * z;
      const ih = img.naturalHeight * z;
      state.current = { x:(canvas.width-iw)/2, y:(canvas.height-ih)/2, zoom:z, dragging:false, lastX:0, lastY:0 };
      setZoom(z);
      draw();
    };
    img.src = imageSrc;
  }, [imageSrc, draw]);

  /* Zoom around canvas centre */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = state.current;
    const img = imgRef.current;
    if (!img.naturalWidth) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const ratio = zoom / s.zoom;
    s.x = cx - (cx - s.x) * ratio;
    s.y = cy - (cy - s.y) * ratio;
    s.zoom = zoom;
    draw();
  }, [zoom, draw]);

  const startDrag  = e => { state.current.dragging=true; state.current.lastX=e.clientX; state.current.lastY=e.clientY; };
  const moveDrag   = e => {
    const s = state.current;
    if (!s.dragging) return;
    s.x += e.clientX - s.lastX; s.y += e.clientY - s.lastY;
    s.lastX = e.clientX; s.lastY = e.clientY;
    draw();
  };
  const stopDrag   = () => { state.current.dragging = false; };
  const touchStart = e => { const t=e.touches[0]; state.current.dragging=true; state.current.lastX=t.clientX; state.current.lastY=t.clientY; };
  const touchMove  = e => {
    const s=state.current; if (!s.dragging) return;
    const t=e.touches[0];
    s.x+=t.clientX-s.lastX; s.y+=t.clientY-s.lastY;
    s.lastX=t.clientX; s.lastY=t.clientY; draw();
  };
  const onWheel = e => { e.preventDefault(); setZoom(z => Math.min(8, Math.max(0.1, z - e.deltaY * 0.002))); };

  /* Export circle crop */
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const s = state.current;
    const out = document.createElement('canvas');
    out.width = out.height = CIRCLE;
    const ctx = out.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = CIRCLE / 2;
    ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(canvas, cx-r, cy-r, CIRCLE, CIRCLE, 0, 0, CIRCLE, CIRCLE);
    out.toBlob(blob => { if (blob) onConfirm(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div className="pc-crop-overlay" onClick={e => e.target === e.currentTarget && !uploading && onCancel()}>
      <div className="pc-crop-modal">
        <div className="pc-crop-header">
          <h3>Crop Profile Photo</h3>
          <button className="pc-crop-close" onClick={() => !uploading && onCancel()}><FiXCircle size={20} /></button>
        </div>

        <div
          className="pc-crop-canvas-wrap"
          onMouseDown={startDrag} onMouseMove={moveDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag}
          onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={stopDrag}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} width={600} height={480} className="pc-crop-canvas" />
          <div className="pc-crop-overlay-ring" />
        </div>

        <div className="pc-crop-controls">
          <button className="pc-zoom-btn" onClick={() => setZoom(z => Math.max(0.1, +(z-0.1).toFixed(2)))}><FiZoomOut size={14} /></button>
          <input type="range" className="pc-zoom-slider" min={0.1} max={8} step={0.01} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} />
          <button className="pc-zoom-btn" onClick={() => setZoom(z => Math.min(8, +(z+0.1).toFixed(2)))}><FiZoomIn size={14} /></button>
          <span>Drag · Scroll to zoom</span>
        </div>

        <div className="pc-crop-actions">
          <button className="pc-btn pc-btn-ghost" onClick={() => !uploading && onCancel()}>Cancel</button>
          <button className="pc-btn pc-btn-primary" onClick={handleConfirm} disabled={uploading}>
            {uploading
              ? <><FiUpload style={{animation:'pc-spin .8s linear infinite'}} size={14}/> Uploading…</>
              : <><FiCheckCircle size={14}/> Apply</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   Profile Page
════════════════════════════════════ */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading]                 = useState(false);
  const [deleting,  setDeleting]                  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cropSrc, setCropSrc]                     = useState(null);

  /* Select file → open crop modal */
  const handleFileSelect = e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Image must be under 10 MB');   return; }
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* Cropped blob → upload */
  const handleCropConfirm = async blob => {
    setUploading(true);
    const fd = new FormData();
    fd.append('ProfilePicture', blob, 'avatar.jpg');
    try {
      const res = await userService.updateProfilePicture(fd);
      // API returns { ProfilePictureUrl: "..." } — handle both casings defensively
      const newUrl = res?.profilePictureUrl ?? res?.ProfilePictureUrl;
      if (!newUrl) throw new Error('No URL returned from server');
      // Patch only profilePicture in the global user state — instant re-render, no re-fetch
      updateUser({ profilePicture: newUrl });
      toast.success('Profile picture updated!');
      setCropSrc(null);
    } catch (err) {
      toast.error(err?.errorMessage || err?.message || 'Failed to update picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    setDeleting(true);
    try {
      await userService.deleteProfilePicture();
      updateUser({ profilePicture: null });
      toast.success('Profile picture removed!');
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to delete picture');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials    = name => !name ? '?' : name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  const getGenderColor = gender => gender === 'Male' ? '#4f46e5' : gender === 'Female' ? '#db2777' : '#6366f1';
  const getLevelColor  = level => ({ Preparatory_Year:'badge-info', First_Year:'badge-success', Second_Year:'badge-warning', Third_Year:'badge-danger', Fourth_Year:'badge-purple', Graduate:'badge-neutral' }[level] || 'badge-neutral');
  const getGPAStatus   = gpa => !gpa ? 'neutral' : gpa >= 3.5 ? 'success' : gpa >= 2.5 ? 'warning' : gpa >= 2.0 ? 'info' : 'danger';

  return (
    <>
      <style>{styles}</style>

      {/* Crop modal lives outside .profile-container so it can cover the full viewport */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          uploading={uploading}
          onConfirm={handleCropConfirm}
          onCancel={() => !uploading && setCropSrc(null)}
        />
      )}

      <div className="profile-container">
        <div className="profile-header">
          <h1><FiUser /> My Profile</h1>
          <p>Manage your personal information and settings</p>
        </div>

        <div className="profile-content">

          {/* ── Left: Profile Card ── */}
          <div className="profile-card">
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                <div className="profile-picture" style={{ backgroundColor: getGenderColor(user?.gender) }}>
                  {user?.profilePicture
                    ? <img src={user.profilePicture} alt={user?.displayName} className="profile-image" />
                    : <span>{getInitials(user?.displayName)}</span>
                  }
                </div>
                <div className="online-status" />
              </div>

              <div className="picture-actions">
                <label
                  className="picture-action-btn upload-btn"
                  style={{ cursor: uploading || deleting ? 'not-allowed' : 'pointer' }}
                >
                  <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading || deleting} style={{ display:'none' }} />
                  <FiCamera />
                  <span className="action-tooltip">Change Photo</span>
                </label>

                {user?.profilePicture && (
                  showDeleteConfirm ? (
                    <div className="delete-confirm">
                      <button className="confirm-btn confirm-yes" onClick={handleDeletePicture} disabled={deleting}>
                        {deleting ? <FiUpload size={14} style={{animation:'pc-spin .8s linear infinite'}} /> : <FiCheckCircle size={14} />}
                      </button>
                      <button className="confirm-btn confirm-no" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                        <FiXCircle size={14} />
                      </button>
                    </div>
                  ) : (
                    <button className="picture-action-btn delete-btn" onClick={() => setShowDeleteConfirm(true)} disabled={uploading || deleting}>
                      <FiTrash2 />
                      <span className="action-tooltip">Delete Photo</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="profile-info">
              <h2 className="profile-name">{user?.displayName || 'N/A'}</h2>
              <p className="profile-username">@{user?.userName || 'username'}</p>

              <div className="profile-badges">
                {user?.roles?.map(role => <span key={role} className="badge badge-primary">{role}</span>)}
                {user?.gender && <span className={`badge ${user.gender === 'Male' ? 'badge-info' : 'badge-pink'}`}>{user.gender}</span>}
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <FiMail className="stat-icon" />
                  <div className="stat-content"><span className="stat-label">Email</span><span className="stat-value">{user?.email || 'N/A'}</span></div>
                </div>
                {user?.phoneNumber && (
                  <div className="stat-item">
                    <FiPhone className="stat-icon" />
                    <div className="stat-content"><span className="stat-label">Phone</span><span className="stat-value">{user.phoneNumber}</span></div>
                  </div>
                )}
                <div className="stat-item">
                  <FiHash className="stat-icon" />
                  <div className="stat-content"><span className="stat-label">Academic Code</span><span className="stat-value">{user?.academicCode || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div className="details-card">
            <div className="details-header">
              <h3>Personal Information</h3>
            </div>

            <div className="details-grid">
              <div className="detail-section">
                <h4 className="section-title">Basic Information</h4>
                <div className="info-grid">
                  <InfoItem icon={<FiUser />}  label="Full Name"     value={user?.displayName} />
                  <InfoItem icon={<FiMail />}  label="Email"         value={user?.email} />
                  <InfoItem icon={<FiPhone />} label="Phone Number"  value={user?.phoneNumber || '—'} />
                  <InfoItem icon={<FiHash />}  label="Academic Code" value={user?.academicCode} />
                </div>
              </div>

              <div className="detail-section">
                <h4 className="section-title">Academic Information</h4>
                <div className="info-grid">
                  <InfoItem icon={<FiBook />}      label="Level"          value={LEVEL_LABELS[user?.level] || user?.level} badgeColor={getLevelColor(user?.level)} />
                  <InfoItem icon={<FiBriefcase />} label="Department"     value={user?.department || '—'} />
                  <InfoItem icon={<FiAward />}     label="Specialization" value={user?.specialization || '—'} />
                </div>
              </div>

              <div className="detail-section">
                <h4 className="section-title">Academic Progress</h4>
                <div className="stats-cards">
                  <div className="stats-card">
                    <div className="stats-card-header"><FiAward className={`stats-icon ${getGPAStatus(user?.totalGPA)}`} /><span className="stats-label">GPA</span></div>
                    <div className={`stats-value ${getGPAStatus(user?.totalGPA)}`}>{user?.totalGPA?.toFixed(2) || '0.00'}</div>
                    <div className="stats-footer">out of 4.00</div>
                  </div>
                  <div className="stats-card">
                    <div className="stats-card-header"><FiTrendingUp className="stats-icon info" /><span className="stats-label">Total Credits</span></div>
                    <div className="stats-value">{user?.totalCredits || '0'}</div>
                    <div className="stats-footer">credits earned</div>
                  </div>
                  <div className="stats-card">
                    <div className="stats-card-header"><FiStar className="stats-icon warning" /><span className="stats-label">Allowed Credits</span></div>
                    <div className="stats-value">{user?.allowedCredits || '0'}</div>
                    <div className="stats-footer">per semester</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function InfoItem({ icon, label, value, badgeColor }) {
  return (
    <div className="info-item">
      <span className="info-icon">{icon}</span>
      <div className="info-content">
        <span className="info-label">{label}</span>
        {badgeColor
          ? <span className={`info-value badge ${badgeColor}`}>{value}</span>
          : <span className="info-value">{value || '—'}</span>
        }
      </div>
    </div>
  );
}