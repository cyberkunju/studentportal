import { useState } from 'react';
import { motion } from 'motion/react';

const VirtualIDCard = ({ student }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Virtual ID Card
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Click on the card to flip it
      </p>
      
      <div 
        className="relative w-[400px] h-[250px] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Front Side */}
          <div
            className="absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-6">
              {/* College Logo/Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">SP</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Student Portal</h3>
                    <p className="text-blue-200 text-xs">College ID Card</p>
                  </div>
                </div>
                <div className="text-white text-xs text-right">
                  <p className="font-semibold">ID: {student.student_id}</p>
                </div>
              </div>

              {/* Student Photo and Info */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  {student.profile_picture ? (
                    <img 
                      src={student.profile_picture} 
                      alt={student.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-white">
                  <h2 className="text-xl font-bold mb-1">
                    {student.first_name} {student.last_name}
                  </h2>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-100">
                      <span className="font-semibold">Roll No:</span> {student.roll_number || student.student_id}
                    </p>
                    <p className="text-blue-100">
                      <span className="font-semibold">Department:</span> {student.department}
                    </p>
                    <p className="text-blue-100">
                      <span className="font-semibold">Batch:</span> {student.batch_year}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-5 rounded-tl-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-5 rounded-br-full"></div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-purple-800 via-blue-700 to-blue-600 p-6">
              {/* Header */}
              <div className="text-center mb-4 pb-3 border-b border-white/30">
                <h3 className="text-white font-bold text-lg">Emergency Contact</h3>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-white text-sm">
                <div>
                  <p className="text-blue-200 text-xs mb-1">Guardian Name</p>
                  <p className="font-semibold">{student.guardian_name || 'Not Available'}</p>
                </div>

                <div>
                  <p className="text-blue-200 text-xs mb-1">Guardian Contact</p>
                  <p className="font-semibold">{student.guardian_phone || student.phone || 'Not Available'}</p>
                </div>

                <div>
                  <p className="text-blue-200 text-xs mb-1">Blood Group</p>
                  <p className="font-semibold text-red-300">{student.blood_group || 'Not Available'}</p>
                </div>

                <div>
                  <p className="text-blue-200 text-xs mb-1">Address</p>
                  <p className="font-semibold text-xs leading-relaxed">
                    {student.address || 'Not Available'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-6 right-6 text-center">
                <p className="text-white/70 text-xs">
                  Valid for Academic Year {student.batch_year}-{parseInt(student.batch_year) + 3}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-tr-full"></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isFlipped ? 'Showing back side' : 'Showing front side'}
        </p>
      </div>
    </div>
  );
};

export default VirtualIDCard;
