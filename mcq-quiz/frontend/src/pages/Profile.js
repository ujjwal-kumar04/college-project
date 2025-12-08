import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaBuilding, FaCamera, FaChalkboardTeacher, FaEnvelope, FaGithub, FaHashtag, FaLinkedin, FaUser } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, loading, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    rollNumber: '',
    class: '',
    linkedin: '',
    leetcode: '',
    github: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        rollNumber: user.rollNumber || '',
        class: user.class || '',
        linkedin: user.linkedin || '',
        leetcode: user.leetcode || '',
        github: user.github || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileData = {
      name: formData.name,
      linkedin: formData.linkedin,
      leetcode: formData.leetcode,
      github: formData.github,
    };
    if (user.role === 'teacher') {
      profileData.department = formData.department;
    }
    if (user.role === 'student') {
      profileData.rollNumber = formData.rollNumber;
      profileData.class = formData.class;
    }
    await updateProfile(profileData);
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('केवल JPG, PNG या GIF फाइलें अपलोड करें');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('फाइल साइज़ 5MB से कम होना चाहिए');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/auth/upload-profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success !== false) {
        setUser(response.data.user);
        toast.success('प्रोफाइल फोटो सफलतापूर्वक अपडेट हो गई!');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('फोटो अपलोड करने में त्रुटि हुई');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please log in to see your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-dark-700 p-8 flex flex-col items-center justify-center">
              <div className="relative">
                <div 
                  onClick={handleImageClick}
                  className="cursor-pointer group"
                  title="Click to view full image"
                >
                  <img
                    className="w-32 h-32 rounded-full object-cover shadow-md group-hover:opacity-80 transition-opacity"
                    src={user.profileImage 
                      ? `http://localhost:5001${user.profileImage}` 
                      : `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    }
                    alt="Profile"
                  />
                  <div className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button 
                  onClick={handleCameraClick}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  title="Upload new photo"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaCamera />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{user.role}</span>
            </div>
            <div className="w-full md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Edit Profile
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    placeholder="Email"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 dark:bg-dark-600 dark:border-dark-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {user.role === 'teacher' && (
                  <div className="relative">
                    <FaBuilding className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                    />
                  </div>
                )}

                {user.role === 'student' && (
                  <>
                    <div className="relative">
                      <FaHashtag className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="Roll Number"
                        className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                      />
                    </div>
                    <div className="relative">
                      <FaChalkboardTeacher className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                      <input
                        type="text"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        placeholder="Class"
                        className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Social Links */}
                <div className="relative">
                  <FaLinkedin className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <SiLeetcode className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="leetcode"
                    value={formData.leetcode}
                    onChange={handleChange}
                    placeholder="LeetCode Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <FaGithub className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="GitHub Profile URL"
                    className="pl-12 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                  />
                </div>


                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-800 transition-transform transform hover:scale-105"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl max-h-[80vh] p-2">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={user.profileImage 
                ? `http://localhost:5001${user.profileImage}` 
                : `https://ui-avatars.com/api/?name=${user.name}&background=random`
              }
              alt="Profile Full View"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">Profile-photo - {user.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;