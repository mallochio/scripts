import os
import hashlib
import vt
import time

# Replace with the path to the directory you want to scan
directory_to_scan = '/Users/sid/Downloads/Rushdie'

# Replace with your VirusTotal API key
api_key = 'xxxx'

def get_file_hash(file_path):
    """Compute the SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for byte_block in iter(lambda: f.read(4096), b''):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def check_file(client, file_path):
    """Check if a file is malicious using VirusTotal."""
    file_hash = get_file_hash(file_path)
    print(f"Scanning file: {file_path} (SHA-256: {file_hash})")
    try:
        # Retrieve file report from VirusTotal
        file_report = client.get_object(f"/files/{file_hash}")
        print(file_report)
        print(file_report.last_analysis_stats)
        # Check if the file is detected as malicious
        if file_report.last_analysis_stats['malicious'] > 0:
            print(f"Malicious file detected: {file_path}")
            print(f"Detection details: {file_report.last_analysis_stats}")
        else:
            print("Not malicious")
    except vt.error.APIError as e:
        if e.code == 'NotFoundError':
            # Upload and scan the file if it is not found in VirusTotal's database
            print("File not found in VirusTotal's database. Uploading and scanning...")
            with open(file_path, 'rb') as f:
                file_info = client.scan_file(f, wait_for_completion=True)
                print(f"Scan results: {file_info}")
                print()
            # File not found in VirusTotal's database
            pass
        else:
            print(f"An error occurred: {e}")    

def main():
    with vt.Client(api_key) as client:
        for root, _, files in os.walk(directory_to_scan):
            for file in files:
                file_path = os.path.join(root, file)
                check_file(client, file_path)
                # Wait for 15 seconds to comply with API rate limits
                time.sleep(15)
    print("Scan complete.")

if __name__ == "__main__":
    main()