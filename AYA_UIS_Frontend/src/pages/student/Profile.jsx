import React, { useState } from 'react';
import {
  FiUser,
  FiCamera,
  FiMail,
  FiPhone,
  FiHash,
  FiAward,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handlePictureChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('ProfilePicture', file);
    try {
      await userService.updateProfilePicture(fd);
      toast.success('Profile picture updated! Please re-login to see changes.');
    } catch (err) {
      toast.error('Failed to update picture');
    }
    setUploading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiUser style={{ marginRight: 8 }} />
          My Profile
        </h1>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}
      >
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              margin: '0 auto 16px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 700,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.displayName?.charAt(0) || 'U'
            )}
          </div>
          <h3>{user?.displayName}</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
            {user?.email}
          </p>
          <span className="badge badge-info" style={{ marginTop: 8 }}>
            {user?.role}
          </span>
          <label
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 16, cursor: 'pointer', display: 'inline-flex' }}
          >
            <FiCamera /> {uploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePictureChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Details */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
          >
            <InfoItem
              icon={<FiUser />}
              label="Full Name"
              value={user?.displayName}
            />
            <InfoItem icon={<FiMail />} label="Email" value={user?.email} />
            <InfoItem
              icon={<FiPhone />}
              label="Phone"
              value={user?.phoneNumber || '—'}
            />
            <InfoItem
              icon={<FiHash />}
              label="Academic Code"
              value={user?.academicCode}
            />
            <InfoItem
              icon={<FiAward />}
              label="Level"
              value={LEVEL_LABELS[user?.level] || user?.level}
            />
            <InfoItem
              icon={<FiAward />}
              label="Department"
              value={user?.department || '—'}
            />
            <InfoItem
              icon={<FiAward />}
              label="Specialization"
              value={user?.specialization || '—'}
            />
            <InfoItem
              icon={<FiAward />}
              label="GPA"
              value={user?.totalGPA?.toFixed(2) || '—'}
            />
            <InfoItem
              icon={<FiAward />}
              label="Total Credits"
              value={user?.totalCredits || '—'}
            />
            <InfoItem
              icon={<FiAward />}
              label="Allowed Credits"
              value={user?.allowedCredits || '—'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
      <span style={{ color: 'var(--primary)', marginTop: 2 }}>{icon}</span>
      <div>
        <small style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
          {label}
        </small>
        <p style={{ fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}
