import struct
import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate-ico.py output.ico input1.png [input2.png ...]")
        sys.exit(1)
        
    out_path = sys.argv[1]
    in_paths = sys.argv[2:]
    
    png_data_list = []
    for path in in_paths:
        with open(path, 'rb') as f:
            png_data_list.append(f.read())
            
    # ICO Header: Reserved (0), Type (1 = Icon), Count
    header = struct.pack('<HHH', 0, 1, len(png_data_list))
    
    entries = []
    offset = 6 + 16 * len(png_data_list)
    
    for i, data in enumerate(png_data_list):
        # Extract width and height from PNG IHDR chunk
        # PNG signature is 8 bytes. IHDR chunk starts at offset 8.
        # IHDR data offset starts at 16 (8 signature + 4 length + 4 chunk type)
        width = struct.unpack('>I', data[16:20])[0]
        height = struct.unpack('>I', data[20:24])[0]
        
        w = 0 if width >= 256 else width
        h = 0 if height >= 256 else height
        
        size = len(data)
        
        # Directory Entry:
        # width (1B), height (1B), color_count (1B, 0), reserved (1B, 0)
        # planes (2B, 1), bpp (2B, 32), size (4B), offset (4B)
        entry = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, size, offset)
        entries.append(entry)
        offset += size
        
    with open(out_path, 'wb') as f:
        f.write(header)
        for entry in entries:
            f.write(entry)
        for data in png_data_list:
            f.write(data)
            
    print(f"Created {out_path} with {len(png_data_list)} images.")

if __name__ == '__main__':
    main()
