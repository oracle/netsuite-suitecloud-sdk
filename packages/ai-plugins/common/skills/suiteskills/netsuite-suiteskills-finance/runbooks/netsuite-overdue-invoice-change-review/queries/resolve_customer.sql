SELECT c.id, c.entityid, c.companyname FROM customer c WHERE c.isinactive = 'F' AND (UPPER(c.entityid) LIKE UPPER('%:name%') OR UPPER(c.companyname) LIKE UPPER('%:name%')) ORDER BY c.entityid, c.id
