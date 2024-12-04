import Docker from 'dockerode';

// Khởi tạo Docker client một lần và export để sử dụng
export const docker = new Docker();

// Có thể thêm các cấu hình khác cho Docker client ở đây
export const dockerConfig = {
  // Ví dụ:
  // socketPath: '/var/run/docker.sock',
  // host: 'localhost',
  // port: 2375
}; 