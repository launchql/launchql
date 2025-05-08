const ipRegExp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

export const parseUrl = (input: string | URL) => {
  const url = typeof input === 'string' ? new URL(input) : input;
  let hostname = url.hostname.replace(/^www\./, '');

  const parts = hostname.split('.');
  let domain: string | null = null;
  let subdomains: string[] | null = null;

  if (hostname === 'localhost') {
    domain = 'localhost';
    subdomains = [];
  } else if (hostname.endsWith('.localhost')) {
    domain = 'localhost';
    subdomains = parts.slice(0, -1); // everything before 'localhost'
  } else if (ipRegExp.test(hostname)) {
    domain = hostname;
    subdomains = [];
  } else if (parts.length >= 2) {
    domain = parts.slice(-2).join('.');
    subdomains = parts.slice(0, -2);
  } else {
    domain = hostname;
    subdomains = [];
  }

  return {
    hostname: url.hostname,
    domain,
    subdomains
  };
};
