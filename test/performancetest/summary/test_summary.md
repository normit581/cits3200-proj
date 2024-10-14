# DocuMatcher Performance Summary

server: localhost

# case 1
### Test samples
- 1 user
- 490 randomly generated .docx files
- each size: 34kb
- each contain ~1200 rsid count

### Objective

The objective of this test was to evaluate the system's performance and responsiveness when uploading .docx files. The test began with 2 .docx files and incremented the upload count by 1 until reaching 490 files. The key metrics analyzed were failure rate and response times (50th and 95th percentiles).

![alt text](<Screenshot 2024-10-13 140316.png>)

### Failures: 
There were no failures recorded during the test, indicated by the flat red line. The system maintained stability and reliability throughout the incremental uploads, with no significant failure rate.

### Response Times:
Trend: Both percentiles show a steady rise in response times, indicating that as more files were uploaded, the system took longer to process requests.

## case 2
### Test samples
- 10 users
- randomly upload 50 - 100 .docx per user
- each size 34kb
- each contain ~1200 rsid count

![alt text](<Screenshot 2024-10-13 151953.png>)

This load test was run for 30 minutes with 10 users randomly uploading between 50 and 100 .docx files. The upper chart shows that the request rate (RPS) stabilized between 3 to 5 requests per second, with no failures throughout the test.

The lower chart indicates response times: the 50th percentile (median) response times fluctuated between 500 ms and 1,500 ms, while the 95th percentile occasionally spiked to over 3,000 ms, indicating some higher latency under load but still without errors.